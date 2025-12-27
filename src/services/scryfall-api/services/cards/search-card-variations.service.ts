import { searchCardsService } from "./serch-cards.service";

export const searchCardVariationsService = async (
  params: SearchCardsServiceParams
) => {
  // Se tiver oracleId, busca por ele; caso contrário, busca pelo nome exato
  const searchQuery = params.oracleId
    ? `oracleid:${params.oracleId}`
    : `!"${params.name}"`;

  const result = await searchCardsService({
    text: searchQuery,
    page: params.page,
    unique: "art",
  });

  return result;
};

export type SearchCardsServiceParams = {
  oracleId?: string;
  name?: string;
  page?: number;
};
