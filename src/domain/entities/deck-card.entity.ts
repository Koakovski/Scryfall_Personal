import { CardData, CardEntity } from "./card.entity";

export interface DeckCardData {
  card: CardData;
  quantity: number;
  tokens?: CardData[];
}

export class DeckCardEntity {
  private constructor(private readonly data: DeckCardData) {}

  static new(
    card: CardEntity,
    quantity: number = 1,
    tokens: CardEntity[] = []
  ): DeckCardEntity {
    return new DeckCardEntity({
      card: card.toData(),
      quantity,
      tokens: tokens.length > 0 ? tokens.map((t) => t.toData()) : undefined,
    });
  }

  static fromData(data: DeckCardData): DeckCardEntity {
    return new DeckCardEntity(data);
  }

  get card(): CardEntity {
    return CardEntity.fromData(this.data.card);
  }

  get quantity(): number {
    return this.data.quantity;
  }

  get cardId(): string {
    return this.data.card.id;
  }

  get cardName(): string {
    return this.data.card.name;
  }

  get tokens(): CardEntity[] {
    return this.data.tokens?.map((t) => CardEntity.fromData(t)) ?? [];
  }

  increaseQuantity(amount: number = 1): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      quantity: this.data.quantity + amount,
    });
  }

  decreaseQuantity(amount: number = 1): DeckCardEntity {
    const newQuantity = Math.max(0, this.data.quantity - amount);
    return new DeckCardEntity({
      ...this.data,
      quantity: newQuantity,
    });
  }

  setQuantity(quantity: number): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      quantity: Math.max(0, quantity),
    });
  }

  /**
   * Atualiza a versão da carta (arte diferente) mantendo a quantidade
   */
  withCardVariation(newCard: CardEntity): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      card: this.card.withVariation(newCard).toData(),
    });
  }

  /**
   * Adiciona tokens à carta do deck
   */
  withTokens(tokens: CardEntity[]): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      tokens: tokens.length > 0 ? tokens.map((t) => t.toData()) : undefined,
    });
  }

  /**
   * Atualiza a versão de um token específico (arte diferente) mantendo os outros tokens
   */
  withTokenVariation(tokenIndex: number, newToken: CardEntity): DeckCardEntity {
    if (!this.data.tokens || tokenIndex < 0 || tokenIndex >= this.data.tokens.length) {
      return this;
    }

    const updatedTokens = [...this.data.tokens];
    const oldToken = CardEntity.fromData(updatedTokens[tokenIndex]);
    updatedTokens[tokenIndex] = oldToken.withVariation(newToken).toData();

    return new DeckCardEntity({
      ...this.data,
      tokens: updatedTokens,
    });
  }

  toData(): DeckCardData {
    return {
      card: { ...this.data.card },
      quantity: this.data.quantity,
      tokens: this.data.tokens?.map((t) => ({ ...t })),
    };
  }
}

