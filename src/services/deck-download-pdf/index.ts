import { jsPDF } from "jspdf";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { CardEntity } from "../../domain/entities/card.entity";
import { DeckCardEntity } from "../../domain/entities/deck-card.entity";
import { toSnakeCase } from "../deck-download";

// Dimensões em mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const GAP_MM = 0.3;

// Definição dos formatos disponíveis
export type PdfFormat = "3x3" | "4x4" | "3x6";

export interface PdfFormatConfig {
  id: PdfFormat;
  label: string;
  description: string;
  cols: number;
  rows: number;
  cardWidth: number;
  cardHeight: number;
  rotate90: boolean;
}

export const PDF_FORMATS: PdfFormatConfig[] = [
  {
    id: "3x3",
    label: "9 cartas - 3×3",
    description: "63mm × 88mm (tamanho padrão)",
    cols: 3,
    rows: 3,
    cardWidth: 63,
    cardHeight: 88,
    rotate90: false,
  },
  {
    id: "4x4",
    label: "16 cartas - 4×4",
    description: "50mm × 69mm",
    cols: 4,
    rows: 4,
    cardWidth: 50,
    cardHeight: 69,
    rotate90: false,
  },
  {
    id: "3x6",
    label: "18 cartas - 3×6",
    description: "66mm × 47mm",
    cols: 3,
    rows: 6,
    cardWidth: 66,
    cardHeight: 47,
    rotate90: true,
  },
];

function getFormatConfig(format: PdfFormat): PdfFormatConfig {
  const config = PDF_FORMATS.find((f) => f.id === format);
  if (!config) {
    throw new Error(`Formato desconhecido: ${format}`);
  }
  return config;
}

function calculateMargins(config: PdfFormatConfig) {
  const totalCardsWidth =
    config.cols * config.cardWidth + (config.cols - 1) * GAP_MM;
  const totalCardsHeight =
    config.rows * config.cardHeight + (config.rows - 1) * GAP_MM;
  const marginX = (A4_WIDTH_MM - totalCardsWidth) / 2;
  const marginY = (A4_HEIGHT_MM - totalCardsHeight) / 2;

  return { marginX, marginY };
}

interface DownloadProgress {
  current: number;
  total: number;
  currentCard: string;
}

type ProgressCallback = (progress: DownloadProgress) => void;

/**
 * Carrega uma imagem e retorna como base64 data URL
 * @param imageUrl - URL da imagem
 * @param rotate90 - Se true, rotaciona a imagem 90 graus no sentido horário
 */
async function loadImageAsBase64(imageUrl: string, rotate90: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      
      if (rotate90) {
        // Quando rotacionamos 90 graus, largura e altura são trocadas
        canvas.width = img.naturalHeight;
        canvas.height = img.naturalWidth;
      } else {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível criar contexto do canvas"));
        return;
      }

      if (rotate90) {
        // Rotaciona 90 graus no sentido horário
        ctx.translate(canvas.width, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, 0, 0);
      } else {
        ctx.drawImage(img, 0, 0);
      }
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error(`Falha ao carregar imagem: ${imageUrl}`));
    };

    // Adiciona timestamp para evitar cache problemático
    const separator = imageUrl.includes("?") ? "&" : "?";
    img.src = `${imageUrl}${separator}_t=${Date.now()}`;
  });
}

/**
 * Carrega uma imagem e cria versão combinada para carta double-faced (frente e verso lado a lado)
 * @param frontUrl - URL da imagem frontal
 * @param backUrl - URL da imagem traseira
 * @param rotate90 - Se true, rotaciona a imagem combinada 90 graus no sentido horário
 */
async function loadDoubleFacedImageAsBase64(
  frontUrl: string,
  backUrl: string,
  rotate90: boolean = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const frontImg = new Image();
    const backImg = new Image();
    frontImg.crossOrigin = "anonymous";
    backImg.crossOrigin = "anonymous";

    let frontLoaded = false;
    let backLoaded = false;

    const tryMerge = () => {
      if (!frontLoaded || !backLoaded) return;

      const canvas = document.createElement("canvas");
      const originalWidth = frontImg.naturalWidth;
      const originalHeight = frontImg.naturalHeight;

      // Canvas com tamanho de uma carta normal (orientação retrato)
      canvas.width = originalWidth;
      canvas.height = originalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Não foi possível criar contexto do canvas"));
        return;
      }

      // Cada carta rotacionada ocupa metade da altura
      const halfHeight = originalHeight / 2;

      // Desenha a frente em cima, rotacionada 90 graus
      ctx.save();
      ctx.translate(originalWidth / 2, halfHeight / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(frontImg, -halfHeight / 2, -originalWidth / 2, halfHeight, originalWidth);
      ctx.restore();

      // Desenha o verso embaixo, rotacionado 90 graus
      ctx.save();
      ctx.translate(originalWidth / 2, halfHeight + halfHeight / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(backImg, -halfHeight / 2, -originalWidth / 2, halfHeight, originalWidth);
      ctx.restore();

      // Se rotate90 está ativo, rotaciona a imagem combinada
      if (rotate90) {
        const rotatedCanvas = document.createElement("canvas");
        rotatedCanvas.width = originalHeight;
        rotatedCanvas.height = originalWidth;
        
        const rotatedCtx = rotatedCanvas.getContext("2d");
        if (!rotatedCtx) {
          reject(new Error("Não foi possível criar contexto do canvas rotacionado"));
          return;
        }
        
        rotatedCtx.translate(rotatedCanvas.width, 0);
        rotatedCtx.rotate(Math.PI / 2);
        rotatedCtx.drawImage(canvas, 0, 0);
        
        const dataUrl = rotatedCanvas.toDataURL("image/jpeg", 0.92);
        resolve(dataUrl);
      } else {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        resolve(dataUrl);
      }
    };

    frontImg.onload = () => {
      frontLoaded = true;
      tryMerge();
    };

    backImg.onload = () => {
      backLoaded = true;
      tryMerge();
    };

    frontImg.onerror = () => {
      reject(new Error(`Falha ao carregar imagem frontal: ${frontUrl}`));
    };

    backImg.onerror = () => {
      reject(new Error(`Falha ao carregar imagem traseira: ${backUrl}`));
    };

    // Adiciona timestamp para evitar cache
    const separator1 = frontUrl.includes("?") ? "&" : "?";
    const separator2 = backUrl.includes("?") ? "&" : "?";
    frontImg.src = `${frontUrl}${separator1}_t=${Date.now()}`;
    backImg.src = `${backUrl}${separator2}_t=${Date.now()}`;
  });
}

interface CardImage {
  dataUrl: string;
  quantity: number;
  name: string;
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

/** Token com possível arte customizada */
interface TokenWithCustomArt {
  card: CardEntity;
  customImageUri?: string;
}

/**
 * Agrupa tokens por nome para identificar versões diferentes
 */
function groupTokensByName(tokens: TokenWithCustomArt[]): Map<string, TokenWithCustomArt[]> {
  const groups = new Map<string, TokenWithCustomArt[]>();

  for (const token of tokens) {
    const name = token.card.name;
    const existing = groups.get(name) || [];
    existing.push(token);
    groups.set(name, existing);
  }

  return groups;
}

/**
 * Baixa todas as imagens do deck e gera um arquivo PDF para impressão A4
 * Cartas double-faced: ambas as faces lado a lado no espaço de uma carta
 *
 * @param deck - O deck a ser exportado
 * @param format - O formato de impressão (3x3, 4x4 ou 3x6)
 * @param onProgress - Callback para acompanhar o progresso
 */
export async function downloadDeckAsPdf(
  deck: DeckEntity,
  format: PdfFormat = "3x3",
  onProgress?: ProgressCallback
): Promise<void> {
  const config = getFormatConfig(format);
  const { marginX, marginY } = calculateMargins(config);
  const { rotate90 } = config;
  const cards = deck.cards;

  // Agrupa cartas por nome para versões
  const cardGroups = groupCardsByName(cards);

  // Coleta todos os tokens únicos com suas artes customizadas
  const allTokens: TokenWithCustomArt[] = [];
  for (const deckCard of cards) {
    const tokensData = deckCard.tokensData;
    for (let i = 0; i < tokensData.length; i++) {
      const tokenData = tokensData[i];
      allTokens.push({
        card: CardEntity.fromData(tokenData.card),
        customImageUri: tokenData.customImageUri,
      });
    }
  }
  const tokenGroups = groupTokensByName(allTokens);

  // Calcula o total de imagens para o progresso
  let totalImages = 0;
  for (const deckCards of cardGroups.values()) {
    totalImages += deckCards.length;
  }
  for (const tokens of tokenGroups.values()) {
    totalImages += tokens.length;
  }

  let currentImage = 0;
  const cardImages: CardImage[] = [];
  const errors: string[] = [];

  // Processa as cartas
  for (const [, deckCards] of cardGroups) {
    for (const deckCard of deckCards) {
      const card = deckCard.card;

      // Atualiza progresso
      currentImage++;
      onProgress?.({
        current: currentImage,
        total: totalImages,
        currentCard: card.name,
      });

      try {
        let dataUrl: string;

        if (card.isDoubleFaced && card.backImageUri) {
          // Para cartas double-faced, combina frente e verso lado a lado
          // Usa artes customizadas se disponíveis
          const frontUri = deckCard.customImageUri ?? card.normalImageUri;
          const backUri = deckCard.customBackImageUri ?? card.backImageUri;
          dataUrl = await loadDoubleFacedImageAsBase64(frontUri, backUri, rotate90);
        } else {
          // Para cartas normais, carrega apenas a frente (usa arte customizada se disponível)
          const imageUri = deckCard.customImageUri ?? card.normalImageUri;
          dataUrl = await loadImageAsBase64(imageUri, rotate90);
        }

        cardImages.push({
          dataUrl,
          quantity: deckCard.quantity,
          name: card.name,
        });
      } catch (error) {
        console.error(`Erro ao carregar carta ${card.name}:`, error);
        errors.push(`Carta: ${card.name}`);
      }
    }
  }

  // Processa os tokens
  for (const [, tokens] of tokenGroups) {
    for (const tokenWithCustomArt of tokens) {
      const token = tokenWithCustomArt.card;
      // Atualiza progresso
      currentImage++;
      onProgress?.({
        current: currentImage,
        total: totalImages,
        currentCard: `Token: ${token.name}`,
      });

      try {
        // Usa arte customizada se disponível, senão usa a original
        const imageUri = tokenWithCustomArt.customImageUri ?? token.normalImageUri;
        const dataUrl = await loadImageAsBase64(imageUri, rotate90);
        cardImages.push({
          dataUrl,
          quantity: 1, // Tokens sempre 1 cópia
          name: `Token: ${token.name}`,
        });
      } catch (error) {
        console.error(`Erro ao carregar token ${token.name}:`, error);
        errors.push(`Token: ${token.name}`);
      }
    }
  }

  // Verifica se alguma imagem foi carregada
  if (cardImages.length === 0) {
    throw new Error(
      `Nenhuma imagem foi carregada. Erros encontrados: ${errors.join(", ")}`
    );
  }

  // Log de avisos se houve erros parciais
  if (errors.length > 0) {
    console.warn(
      `Algumas imagens não puderam ser carregadas: ${errors.join(", ")}`
    );
  }

  // Expande as cartas pela quantidade
  const expandedImages: CardImage[] = [];
  for (const cardImage of cardImages) {
    for (let i = 0; i < cardImage.quantity; i++) {
      expandedImages.push(cardImage);
    }
  }

  // Coleta apenas as imagens de tokens para preenchimento
  const tokenImages = cardImages.filter((img) => img.name.startsWith("Token:"));

  // Calcula se há espaços em branco na última página e preenche com tokens
  const cardsPerPage = config.cols * config.rows;
  const remainder = expandedImages.length % cardsPerPage;
  
  if (remainder > 0 && tokenImages.length > 0) {
    const emptySlots = cardsPerPage - remainder;
    
    // Preenche os espaços em branco com tokens (repetindo se necessário)
    for (let i = 0; i < emptySlots; i++) {
      const tokenIndex = i % tokenImages.length;
      expandedImages.push(tokenImages[tokenIndex]);
    }
  }

  // Gera o PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let cardIndex = 0;
  let pageIndex = 0;

  while (cardIndex < expandedImages.length) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    // Adiciona cartas à página atual
    for (
      let row = 0;
      row < config.rows && cardIndex < expandedImages.length;
      row++
    ) {
      for (
        let col = 0;
        col < config.cols && cardIndex < expandedImages.length;
        col++
      ) {
        const cardImage = expandedImages[cardIndex];
        const x = marginX + col * (config.cardWidth + GAP_MM);
        const y = marginY + row * (config.cardHeight + GAP_MM);

        try {
          pdf.addImage(
            cardImage.dataUrl,
            "JPEG",
            x,
            y,
            config.cardWidth,
            config.cardHeight
          );
        } catch (error) {
          console.error(
            `Erro ao adicionar imagem ao PDF: ${cardImage.name}`,
            error
          );
        }

        cardIndex++;
      }
    }

    pageIndex++;
  }

  // Salva o PDF
  const pdfFileName = `${toSnakeCase(deck.name)}_deck_${format}_a4.pdf`;
  pdf.save(pdfFileName);
}
