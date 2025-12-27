import { ScryfallEndPoint } from "../../scryfall.endpoint";
import { scryfallHttpClient } from "../../scryfall.http-client";
import { SetList } from "../../types/set";

let cachedSets: SetList | null = null;

/**
 * Busca todos os sets disponíveis no Scryfall.
 * Os resultados são cacheados para evitar múltiplas requisições.
 */
export const getAllSetsService = async () => {
  if (cachedSets) {
    return { success: true as const, data: cachedSets };
  }

  const result = await scryfallHttpClient.get<SetList>(ScryfallEndPoint.sets());

  if (result.success) {
    cachedSets = result.data;
  }

  return result;
};

/**
 * Limpa o cache de sets (útil para forçar uma nova busca)
 */
export const clearSetsCache = () => {
  cachedSets = null;
};

