import { ScryfallEndPoint } from "../../scryfall.endpoint";
import { scryfallHttpClient } from "../../scryfall.http-client";
import { Card } from "../../types/card";

export const getCardByNameService = async (name: string) => {
  const result = await scryfallHttpClient.get<Card>(
    ScryfallEndPoint.namedCard(),
    {
      params: {
        fuzzy: name,
      },
    }
  );

  return result;
};

