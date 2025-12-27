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

  /**
   * Exporta todos os decks como JSON string
   */
  exportAllDecksAsJson(): string {
    const decks = this.getAllDecksData();
    return JSON.stringify(decks, null, 2);
  },

  /**
   * Importa decks a partir de uma JSON string (array de decks)
   * Adiciona ao array existente, gerando novos IDs para evitar conflitos
   */
  importDecksFromJson(jsonString: string): { imported: number; errors: number } {
    try {
      const importedDecks = JSON.parse(jsonString) as DeckData[];
      
      if (!Array.isArray(importedDecks)) {
        return { imported: 0, errors: 1 };
      }

      let imported = 0;
      let errors = 0;

      for (const deckData of importedDecks) {
        try {
          // Gera um novo ID para evitar conflitos
          const newData: DeckData = {
            ...deckData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const deck = DeckEntity.fromData(newData);
          this.saveDeck(deck);
          imported++;
        } catch {
          errors++;
        }
      }

      return { imported, errors };
    } catch {
      return { imported: 0, errors: 1 };
    }
  },

  /**
   * Faz download do arquivo JSON com todos os decks
   */
  downloadAllDecksAsJson(): void {
    const jsonString = this.exportAllDecksAsJson();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scryfall-decks-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

