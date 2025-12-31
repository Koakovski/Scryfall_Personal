import { ScryfallEndPoint } from "../../scryfall.endpoint";
import { scryfallHttpClient } from "../../scryfall.http-client";
import { Card } from "../../types/card";

/**
 * Busca uma carta pelo nome exato em uma coleção específica
 * Se a carta não for encontrada na coleção, retorna erro
 */
export const getCardByNameAndSetService = async (
  name: string,
  setCode: string
) => {
  const result = await scryfallHttpClient.get<Card>(
    ScryfallEndPoint.namedCard(),
    {
      params: {
        exact: name,
        set: setCode.toLowerCase(),
      },
    }
  );

  // Verificação extra: garante que o nome retornado é exatamente igual ao buscado
  // (ignora case, pois a API pode retornar com capitalização diferente)
  if (result.success && result.data.name.toLowerCase() !== name.toLowerCase()) {
    return {
      success: false as const,
      error: new Error(`Card name mismatch: expected "${name}", got "${result.data.name}"`),
    };
  }

  return result;
};
