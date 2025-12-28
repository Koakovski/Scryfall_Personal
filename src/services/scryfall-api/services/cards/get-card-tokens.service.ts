import { CardEntity } from "../../../../domain/entities/card.entity";
import { Card, RelatedCard } from "../../types/card";
import { getCardByIdService } from "./get-card-by-id.service";
import { getCardByNameAndSetService } from "./get-card-by-name-and-set.service";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Busca os tokens de uma carta baseado no all_parts
 * Se preferredSetCode estiver definido, tenta buscar a versão do token dessa coleção
 */
export const getCardTokensService = async (
  card: Card,
  preferredSetCode?: string
): Promise<CardEntity[]> => {
  if (!card.all_parts) return [];

  const tokenParts = card.all_parts.filter(
    (part: RelatedCard) => part.component === "token"
  );

  if (tokenParts.length === 0) return [];

  const tokens: CardEntity[] = [];
  const seenTokenNames = new Set<string>();

  for (const tokenPart of tokenParts) {
    // Evita duplicar tokens com o mesmo nome
    if (seenTokenNames.has(tokenPart.name)) continue;
    seenTokenNames.add(tokenPart.name);

    // Busca o token pelo ID
    const tokenResult = await getCardByIdService(tokenPart.id);
    await delay(100);

    if (tokenResult.success) {
      let tokenEntity = CardEntity.new(tokenResult.data);

      // Se tiver preferred set, tenta buscar a versão do token dessa coleção
      if (preferredSetCode) {
        const preferredTokenResult = await getCardByNameAndSetService(
          tokenEntity.name,
          preferredSetCode
        );
        if (preferredTokenResult.success) {
          tokenEntity = CardEntity.new(preferredTokenResult.data);
        }
        await delay(100);
      }

      tokens.push(tokenEntity);
    }
  }

  return tokens;
};


