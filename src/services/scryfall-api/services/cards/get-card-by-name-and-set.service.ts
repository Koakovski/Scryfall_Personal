import { ScryfallEndPoint } from "../../scryfall.endpoint";
import { scryfallHttpClient } from "../../scryfall.http-client";
import { Card } from "../../types/card";

/**
 * Busca uma carta pelo nome exato em uma coleção específica
 * Se a carta não for encontrada na coleção, retorna null
 */
export const getCardByNameAndSetService = async (
  name: string,
  setCode: string
) => {
  const result = await scryfallHttpClient.get<Card>(
    ScryfallEndPoint.namedCard(),
    {
      params: {
        fuzzy: name,
        set: setCode.toLowerCase(),
      },
    }
  );

  return result;
};

