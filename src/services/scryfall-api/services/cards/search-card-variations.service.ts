import { searchCardsService } from "./serch-cards.service";

export const searchCardVariationsService = async (
  params: SearchCardsServiceParams
) => {
  const result = await searchCardsService({
    text: `oracleid:${params.oracleId}`,
    page: params.page,
    unique: "art",
  });

  return result;
};

export type SearchCardsServiceParams = {
  oracleId: string;
  page?: number;
};
