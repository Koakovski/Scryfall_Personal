import { DeckData, DeckEntity } from "../../domain/entities/deck.entity";

const DECKS_STORAGE_KEY = "scryfall_personal_decks";

export const deckStorageService = {
  /**
   * Salva um deck no localStorage
   */
  saveDeck(deck: DeckEntity): void {
    const decks = this.getAllDecksData();
    const existingIndex = decks.findIndex((d) => d.id === deck.id);

    if (existingIndex >= 0) {
      decks[existingIndex] = deck.toData();
    } else {
      decks.push(deck.toData());
    }

    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
  },

  /**
   * Recupera todos os decks salvos como DeckEntity
   */
  getAllDecks(): DeckEntity[] {
    return this.getAllDecksData().map((data) => DeckEntity.fromData(data));
  },

  /**
   * Recupera os dados brutos de todos os decks
   */
  getAllDecksData(): DeckData[] {
    const data = localStorage.getItem(DECKS_STORAGE_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data) as DeckData[];
    } catch {
      return [];
    }
  },

  /**
   * Recupera um deck pelo ID
   */
  getDeckById(id: string): DeckEntity | null {
    const data = this.getAllDecksData().find((d) => d.id === id);
    return data ? DeckEntity.fromData(data) : null;
  },

  /**
   * Remove um deck pelo ID
   */
  deleteDeck(id: string): void {
    const decks = this.getAllDecksData().filter((d) => d.id !== id);
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
  },

  /**
   * Exporta um deck como JSON string
   */
  exportDeckAsJson(deck: DeckEntity): string {
    return JSON.stringify(deck.toData(), null, 2);
  },

  /**
   * Importa um deck a partir de uma JSON string
   */
  importDeckFromJson(jsonString: string): DeckEntity | null {
    try {
      const data = JSON.parse(jsonString) as DeckData;
      // Gera um novo ID para evitar conflitos
      const newData: DeckData = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return DeckEntity.fromData(newData);
    } catch {
      return null;
    }
  },

  /**
   * Limpa todos os decks salvos
   */
  clearAllDecks(): void {
    localStorage.removeItem(DECKS_STORAGE_KEY);
  },
};

