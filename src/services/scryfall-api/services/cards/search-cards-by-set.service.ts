import { searchCardsService } from "./serch-cards.service";

/**
 * Busca variações de uma carta específica em uma coleção
 * Usa oracleId ou nome para identificar a carta
 * Retorna com unique: "prints" para mostrar todas as variações de impressão
 */
export const searchCardVariationsBySetService = async (
  params: SearchCardVariationsBySetParams
) => {
  // Combina a busca por carta com a coleção
  const cardQuery = params.oracleId
    ? `oracleid:${params.oracleId}`
    : `!"${params.name}"`;
  
  const searchQuery = `${cardQuery} set:${params.setCode}`;

  const result = await searchCardsService({
    text: searchQuery,
    page: params.page,
    unique: "prints",
    order: "set",
  });

  return result;
};

export type SearchCardVariationsBySetParams = {
  setCode: string;
  oracleId?: string;
  name?: string;
  page?: number;
};

