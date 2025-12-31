import JSZip from "jszip";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { CardEntity } from "../../domain/entities/card.entity";
import { DeckCardEntity } from "../../domain/entities/deck-card.entity";

/**
 * Converte uma string para snake_case
 */
function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "_") // Substitui espaços por underscores
    .replace(/_+/g, "_") // Remove underscores duplicados
    .replace(/^_|_$/g, ""); // Remove underscores no início e fim
}

/**
 * Faz o download de uma imagem e retorna como Blob
 * Usa canvas para contornar problemas de CORS
 */
async function fetchImageAsBlob(imageUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível criar contexto do canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(`Falha ao converter imagem para blob: ${imageUrl}`));
          }
        },
        "image/jpeg",
        0.95
      );
    };

    img.onerror = () => {
      reject(new Error(`Falha ao carregar imagem: ${imageUrl}`));
    };

    // Adiciona timestamp para evitar cache problemático
    const separator = imageUrl.includes("?") ? "&" : "?";
    img.src = `${imageUrl}${separator}_t=${Date.now()}`;
  });
}

interface DownloadProgress {
  current: number;
  total: number;
  currentCard: string;
}

type ProgressCallback = (progress: DownloadProgress) => void;

/**
 * Gera o nome do arquivo para uma carta
 */
function generateFileName(
  cardName: string,
  options: {
    isToken?: boolean;
    versionNumber?: number;
    isBackFace?: boolean;
  } = {}
): string {
  const { isToken, versionNumber, isBackFace } = options;

  let fileName = toSnakeCase(cardName);

  // Se for token, adiciona prefixo _token_
  if (isToken) {
    fileName = `_token_${fileName}`;
  }

  // Se tiver número de versão, adiciona sufixo _version_N
  if (versionNumber !== undefined && versionNumber > 0) {
    fileName = `${fileName}_version_${versionNumber}`;
  }

  // Se for o verso de uma carta double-faced
  if (isBackFace) {
    fileName = `${fileName}_back`;
  }

  return `${fileName}.jpg`;
}

/**
 * Agrupa cartas por nome para identificar versões diferentes
 */
function groupCardsByName(
  cards: DeckCardEntity[]
): Map<string, DeckCardEntity[]> {
  const groups = new Map<string, DeckCardEntity[]>();

  for (const deckCard of cards) {
    const name = deckCard.card.name;
    const existing = groups.get(name) || [];
    existing.push(deckCard);
    groups.set(name, existing);
  }

  return groups;
}

/**
 * Agrupa tokens por nome para identificar versões diferentes
 */
function groupTokensByName(tokens: CardEntity[]): Map<string, CardEntity[]> {
  const groups = new Map<string, CardEntity[]>();

  for (const token of tokens) {
    const name = token.name;
    const existing = groups.get(name) || [];
    existing.push(token);
    groups.set(name, existing);
  }

  return groups;
}

/**
 * Baixa todas as imagens do deck e gera um arquivo ZIP
 */
export async function downloadDeckAsZip(
  deck: DeckEntity,
  onProgress?: ProgressCallback
): Promise<void> {
  const zip = new JSZip();
  const cards = deck.cards;

  // Agrupa cartas por nome para versões
  const cardGroups = groupCardsByName(cards);

  // Coleta todos os tokens únicos
  const allTokens: CardEntity[] = [];
  for (const deckCard of cards) {
    allTokens.push(...deckCard.tokens);
  }
  const tokenGroups = groupTokensByName(allTokens);

  // Calcula o total de imagens para o progresso
  let totalImages = 0;
  for (const deckCards of cardGroups.values()) {
    for (const deckCard of deckCards) {
      totalImages++; // Imagem principal
      if (deckCard.card.isDoubleFaced) {
        totalImages++; // Verso da carta
      }
    }
  }
  for (const tokens of tokenGroups.values()) {
    totalImages += tokens.length;
  }

  let currentImage = 0;
  let downloadedImages = 0;
  const errors: string[] = [];

  // Processa as cartas
  for (const [cardName, deckCards] of cardGroups) {
    const hasMultipleVersions = deckCards.length > 1;

    for (let i = 0; i < deckCards.length; i++) {
      const deckCard = deckCards[i];
      const card = deckCard.card;

      // Atualiza progresso
      currentImage++;
      onProgress?.({
        current: currentImage,
        total: totalImages,
        currentCard: card.name,
      });

      // Baixa a imagem principal da carta
      try {
        const fileName = generateFileName(cardName, {
          versionNumber: hasMultipleVersions ? i + 1 : undefined,
        });

        const imageBlob = await fetchImageAsBlob(card.normalImageUri);
        zip.file(fileName, imageBlob);
        downloadedImages++;

        // Se for double-faced, baixa o verso também
        if (card.isDoubleFaced && card.backImageUri) {
          currentImage++;
          onProgress?.({
            current: currentImage,
            total: totalImages,
            currentCard: `${card.name} (verso)`,
          });

          const backFileName = generateFileName(cardName, {
            versionNumber: hasMultipleVersions ? i + 1 : undefined,
            isBackFace: true,
          });

          const backImageBlob = await fetchImageAsBlob(card.backImageUri);
          zip.file(backFileName, backImageBlob);
          downloadedImages++;
        }
      } catch (error) {
        console.error(`Erro ao baixar carta ${card.name}:`, error);
        errors.push(`Carta: ${card.name}`);
      }
    }
  }

  // Processa os tokens
  for (const [tokenName, tokens] of tokenGroups) {
    const hasMultipleVersions = tokens.length > 1;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Atualiza progresso
      currentImage++;
      onProgress?.({
        current: currentImage,
        total: totalImages,
        currentCard: `Token: ${token.name}`,
      });

      try {
        const fileName = generateFileName(tokenName, {
          isToken: true,
          versionNumber: hasMultipleVersions ? i + 1 : undefined,
        });

        const imageBlob = await fetchImageAsBlob(token.normalImageUri);
        zip.file(fileName, imageBlob);
        downloadedImages++;
      } catch (error) {
        console.error(`Erro ao baixar token ${token.name}:`, error);
        errors.push(`Token: ${token.name}`);
      }
    }
  }

  // Verifica se alguma imagem foi baixada
  if (downloadedImages === 0) {
    throw new Error(
      `Nenhuma imagem foi baixada. Erros encontrados: ${errors.join(", ")}`
    );
  }

  // Log de avisos se houve erros parciais
  if (errors.length > 0) {
    console.warn(
      `Algumas imagens não puderam ser baixadas: ${errors.join(", ")}`
    );
  }

  // Gera o arquivo ZIP
  const zipBlob = await zip.generateAsync({ type: "blob" });

  // Faz o download do arquivo
  const deckFileName = `${toSnakeCase(deck.name)}_deck.zip`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(zipBlob);
  link.download = deckFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export { toSnakeCase, generateFileName };




