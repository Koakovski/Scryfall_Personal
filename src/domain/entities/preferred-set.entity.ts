export interface PreferredSetData {
  code: string;
  name: string;
}

export class PreferredSetEntity {
  private constructor(private readonly data: PreferredSetData) {}

  static new(code: string, name: string): PreferredSetEntity {
    return new PreferredSetEntity({
      code: code.toLowerCase(),
      name,
    });
  }

  static fromData(data: PreferredSetData): PreferredSetEntity {
    return new PreferredSetEntity(data);
  }

  get code(): string {
    return this.data.code;
  }

  get name(): string {
    return this.data.name;
  }

  toData(): PreferredSetData {
    return { ...this.data };
  }
}

