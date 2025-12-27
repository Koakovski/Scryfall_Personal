export type SetType =
  | "core"
  | "expansion"
  | "masters"
  | "alchemy"
  | "masterpiece"
  | "arsenal"
  | "from_the_vault"
  | "spellbook"
  | "premium_deck"
  | "duel_deck"
  | "draft_innovation"
  | "treasure_chest"
  | "commander"
  | "planechase"
  | "archenemy"
  | "vanguard"
  | "funny"
  | "starter"
  | "box"
  | "promo"
  | "token"
  | "memorabilia"
  | "minigame";

export type Set = {
  object: "set";
  id: string;
  code: string;
  name: string;
  uri: string;
  scryfall_uri: string;
  search_uri: string;
  released_at: string;
  set_type: SetType;
  card_count: number;
  digital: boolean;
  nonfoil_only: boolean;
  foil_only: boolean;
  icon_svg_uri: string;
  parent_set_code?: string;
  block_code?: string;
  block?: string;
};

export type SetList = {
  object: "list";
  has_more: boolean;
  data: Set[];
};

