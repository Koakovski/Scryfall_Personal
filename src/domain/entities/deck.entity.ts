import { CardEntity } from "./card.entity";
import { DeckCardData, DeckCardEntity } from "./deck-card.entity";

export interface DeckData {
  id: string;
  name: string;
  cards: DeckCardData[];
  createdAt: string;
  updatedAt: string;
}

export class DeckEntity {
  private constructor(private readonly data: DeckData) {}

  static new(name: string, cards: DeckCardEntity[] = []): DeckEntity {
    const now = new Date().toISOString();
    return new DeckEntity({
      id: crypto.randomUUID(),
      name,
      cards: cards.map((card) => card.toData()),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromData(data: DeckData): DeckEntity {
    return new DeckEntity(data);
  }

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get cards(): DeckCardEntity[] {
    return this.data.cards.map((card) => DeckCardEntity.fromData(card));
  }

  /**
   * Retorna o número de cartas únicas no deck
   */
  get uniqueCardCount(): number {
    return this.data.cards.length;
  }

  /**
   * Retorna o número total de cartas no deck (somando as quantidades)
   */
  get totalCardCount(): number {
    return this.data.cards.reduce((total, card) => total + card.quantity, 0);
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get updatedAt(): string {
    return this.data.updatedAt;
  }

  /**
   * Adiciona uma carta ao deck. Se a carta já existir (mesmo cardId), aumenta a quantidade.
   */
  addCard(card: CardEntity, quantity: number = 1): this {
    const existingIndex = this.data.cards.findIndex(
      (c) => c.card.id === card.id
    );

    if (existingIndex !== -1) {
      this.data.cards[existingIndex].quantity += quantity;
    } else {
      this.data.cards.push(DeckCardEntity.new(card, quantity).toData());
    }

    this.data.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Remove uma carta completamente do deck
   */
  removeCard(cardId: string): this {
    const index = this.data.cards.findIndex((c) => c.card.id === cardId);
    if (index === -1) return this;

    this.data.cards.splice(index, 1);
    this.data.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Atualiza a quantidade de uma carta específica
   */
  updateCardQuantity(cardId: string, quantity: number): this {
    const index = this.data.cards.findIndex((c) => c.card.id === cardId);
    if (index === -1) return this;

    if (quantity <= 0) {
      this.data.cards.splice(index, 1);
    } else {
      this.data.cards[index].quantity = quantity;
    }

    this.data.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Aumenta a quantidade de uma carta específica
   */
  increaseCardQuantity(cardId: string, amount: number = 1): this {
    const index = this.data.cards.findIndex((c) => c.card.id === cardId);
    if (index === -1) return this;

    this.data.cards[index].quantity += amount;
    this.data.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Diminui a quantidade de uma carta específica. Remove se chegar a 0.
   */
  decreaseCardQuantity(cardId: string, amount: number = 1): this {
    const index = this.data.cards.findIndex((c) => c.card.id === cardId);
    if (index === -1) return this;

    const newQuantity = this.data.cards[index].quantity - amount;
    if (newQuantity <= 0) {
      this.data.cards.splice(index, 1);
    } else {
      this.data.cards[index].quantity = newQuantity;
    }

    this.data.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Atualiza a versão/arte de uma carta mantendo a quantidade
   */
  updateCardVersion(cardId: string, newCard: CardEntity): this {
    const index = this.data.cards.findIndex((c) => c.card.id === cardId);
    if (index === -1) return this;

    const deckCard = DeckCardEntity.fromData(this.data.cards[index]);
    this.data.cards[index] = deckCard.withCardVariation(newCard).toData();
    this.data.updatedAt = new Date().toISOString();
    return this;
  }

  updateName(name: string): this {
    this.data.name = name;
    this.data.updatedAt = new Date().toISOString();
    return this;
  }

  toData(): DeckData {
    return { ...this.data };
  }
}
