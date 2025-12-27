import { ScryfallEndPoint } from "../../scryfall.endpoint";
import { scryfallHttpClient } from "../../scryfall.http-client";
import { Card } from "../../types/card";

export const getCardByIdService = async (id: string) => {
  const result = await scryfallHttpClient.get<Card>(
    ScryfallEndPoint.cardById(id)
  );

  return result;
};
