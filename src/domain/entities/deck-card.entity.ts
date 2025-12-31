import { CardData, CardEntity } from "./card.entity";

/** Dados de um token com possível arte customizada */
export interface TokenData {
  card: CardData;
  /** URL da arte customizada do token */
  customImageUri?: string;
}

export interface DeckCardData {
  card: CardData;
  quantity: number;
  /** @deprecated Usar tokensData ao invés */
  tokens?: CardData[];
  /** Tokens com suporte a arte customizada */
  tokensData?: TokenData[];
  /** URL da arte customizada da frente (upload do usuário ou URL externa) */
  customImageUri?: string;
  /** URL da arte customizada do verso (para cartas double-faced) */
  customBackImageUri?: string;
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
      tokensData: tokens.length > 0 
        ? tokens.map((t) => ({ card: t.toData() })) 
        : undefined,
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

  /** Retorna os tokens (compatível com estrutura antiga e nova) */
  get tokens(): CardEntity[] {
    // Prioriza a nova estrutura
    if (this.data.tokensData) {
      return this.data.tokensData.map((t) => CardEntity.fromData(t.card));
    }
    // Fallback para estrutura antiga
    return this.data.tokens?.map((t) => CardEntity.fromData(t)) ?? [];
  }

  /** Retorna os dados completos dos tokens (com arte customizada) */
  get tokensData(): TokenData[] {
    // Prioriza a nova estrutura
    if (this.data.tokensData) {
      return this.data.tokensData;
    }
    // Converte estrutura antiga para nova
    return this.data.tokens?.map((t) => ({ card: t })) ?? [];
  }

  /** Retorna a URL da arte customizada da frente, se houver */
  get customImageUri(): string | undefined {
    return this.data.customImageUri;
  }

  /** Retorna a URL da arte customizada do verso, se houver */
  get customBackImageUri(): string | undefined {
    return this.data.customBackImageUri;
  }

  /** Retorna a URL da imagem da frente a ser exibida (customizada ou original) */
  get displayImageUri(): string {
    return this.data.customImageUri ?? this.card.normalImageUri;
  }

  /** Retorna a URL da imagem do verso a ser exibida (customizada ou original) */
  get displayBackImageUri(): string | undefined {
    if (!this.card.isDoubleFaced) return undefined;
    return this.data.customBackImageUri ?? this.card.backImageUri;
  }

  /** Retorna a URL da arte customizada de um token específico */
  getTokenCustomImageUri(tokenIndex: number): string | undefined {
    return this.tokensData[tokenIndex]?.customImageUri;
  }

  /** Retorna a URL de exibição de um token (customizada ou original) */
  getTokenDisplayImageUri(tokenIndex: number): string {
    const tokenData = this.tokensData[tokenIndex];
    if (!tokenData) return "";
    return tokenData.customImageUri ?? CardEntity.fromData(tokenData.card).normalImageUri;
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
      tokens: undefined, // Remove estrutura antiga
      tokensData: tokens.length > 0 
        ? tokens.map((t) => ({ card: t.toData() })) 
        : undefined,
    });
  }

  /**
   * Atualiza a versão de um token específico (arte diferente) mantendo os outros tokens
   */
  withTokenVariation(tokenIndex: number, newToken: CardEntity): DeckCardEntity {
    const currentTokens = this.tokensData;
    if (tokenIndex < 0 || tokenIndex >= currentTokens.length) {
      return this;
    }

    const updatedTokens = [...currentTokens];
    const oldToken = CardEntity.fromData(updatedTokens[tokenIndex].card);
    updatedTokens[tokenIndex] = {
      ...updatedTokens[tokenIndex],
      card: oldToken.withVariation(newToken).toData(),
    };

    return new DeckCardEntity({
      ...this.data,
      tokens: undefined, // Remove estrutura antiga
      tokensData: updatedTokens,
    });
  }

  /**
   * Define uma arte customizada para a frente da carta
   * @param imageUri URL da imagem customizada (pode ser data URL de upload ou URL externa)
   */
  withCustomArt(imageUri: string): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      customImageUri: imageUri,
    });
  }

  /**
   * Remove a arte customizada da frente, voltando à arte original
   */
  removeCustomArt(): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      customImageUri: undefined,
    });
  }

  /**
   * Define uma arte customizada para o verso da carta (double-faced)
   * @param imageUri URL da imagem customizada
   */
  withCustomBackArt(imageUri: string): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      customBackImageUri: imageUri,
    });
  }

  /**
   * Remove a arte customizada do verso, voltando à arte original
   */
  removeCustomBackArt(): DeckCardEntity {
    return new DeckCardEntity({
      ...this.data,
      customBackImageUri: undefined,
    });
  }

  /**
   * Define uma arte customizada para um token específico
   * @param tokenIndex Índice do token
   * @param imageUri URL da imagem customizada
   */
  withTokenCustomArt(tokenIndex: number, imageUri: string): DeckCardEntity {
    const currentTokens = this.tokensData;
    if (tokenIndex < 0 || tokenIndex >= currentTokens.length) {
      return this;
    }

    const updatedTokens = [...currentTokens];
    updatedTokens[tokenIndex] = {
      ...updatedTokens[tokenIndex],
      customImageUri: imageUri,
    };

    return new DeckCardEntity({
      ...this.data,
      tokens: undefined,
      tokensData: updatedTokens,
    });
  }

  /**
   * Remove a arte customizada de um token específico
   * @param tokenIndex Índice do token
   */
  removeTokenCustomArt(tokenIndex: number): DeckCardEntity {
    const currentTokens = this.tokensData;
    if (tokenIndex < 0 || tokenIndex >= currentTokens.length) {
      return this;
    }

    const updatedTokens = [...currentTokens];
    updatedTokens[tokenIndex] = {
      ...updatedTokens[tokenIndex],
      customImageUri: undefined,
    };

    return new DeckCardEntity({
      ...this.data,
      tokens: undefined,
      tokensData: updatedTokens,
    });
  }

  toData(): DeckCardData {
    // Converte tokensData para o formato correto
    const tokensData = this.tokensData.length > 0 
      ? this.tokensData.map((t) => ({
          card: { ...t.card },
          customImageUri: t.customImageUri,
        }))
      : undefined;

    return {
      card: { ...this.data.card },
      quantity: this.data.quantity,
      tokensData,
      customImageUri: this.data.customImageUri,
      customBackImageUri: this.data.customBackImageUri,
    };
  }
}

