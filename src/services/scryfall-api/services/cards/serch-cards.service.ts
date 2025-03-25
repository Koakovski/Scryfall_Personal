import { ScryfallEndPoint } from "../../scryfall.endpoint";
import { scryfallHttpClient } from "../../scryfall.http-client";
import { Card } from "../../types/card";
import { List } from "../../types/list";

export const searchCardsService = async (params: SearchCardsServiceParams) => {
  const result = await scryfallHttpClient.get<List<Card>>(
    ScryfallEndPoint.searchCards(),
    {
      params: {
        q: params.text,
        page: params.page ?? 1,
      },
    }
  );

  return result;
};

export type SearchCardsServiceParams = {
  text: string;
  page?: number;
};
