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
        unique: params.unique ?? "cards",
        order: params.order ?? "name",
      },
    }
  );

  return result;
};

export type SearchCardsServiceParams = {
  text: string;
  page?: number;
  unique?: "cards" | "art" | "prints";
  order?:
    | "name"
    | "set"
    | "released"
    | "rarity"
    | "color"
    | "usd"
    | "tix"
    | "eur"
    | "cmc"
    | "power"
    | "toughness"
    | "edhrec"
    | "penny"
    | "artist"
    | "review";
};
