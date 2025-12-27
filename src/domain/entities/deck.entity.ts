import { CardData, CardEntity } from "./card.entity";

export interface DeckData {
  id: string;
  name: string;
  cards: CardData[];
  createdAt: string;
  updatedAt: string;
}

export class DeckEntity {
  private constructor(private readonly data: DeckData) {}

  static new(name: string, cards: CardEntity[] = []): DeckEntity {
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

  get cards(): CardEntity[] {
    return this.data.cards.map((card) => CardEntity.fromData(card));
  }

  get cardCount(): number {
    return this.data.cards.length;
  }

  get createdAt(): string {
    return this.data.createdAt;
  }

  get updatedAt(): string {
    return this.data.updatedAt;
  }

  addCard(card: CardEntity): this {
    this.data.cards.push(card.toData());
    this.data.updatedAt = new Date().toISOString();
    return this;
  }

  removeCard(cardId: string): this {
    const index = this.data.cards.findIndex((c) => c.id === cardId);
    if (index === -1) return this;

    this.data.cards.splice(index, 1);
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
