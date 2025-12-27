export type CardColor = "W" | "U" | "B" | "R" | "G";

export type CardRarity = "common" | "uncommon" | "rare" | "mythic";

export type CardLayout =
  | "normal"
  | "split"
  | "flip"
  | "transform"
  | "modal_dfc"
  | "meld"
  | "leveler"
  | "saga"
  | "adventure"
  | "planar"
  | "scheme"
  | "vanguard"
  | "token"
  | "double_faced_token"
  | "emblem"
  | "augment"
  | "host"
  | "art_series"
  | "reversible_card";

export type CardFrameEffect =
  | "legendary"
  | "miracle"
  | "nyxtouched"
  | "draft"
  | "devoid"
  | "tombstone"
  | "colorshifted"
  | "inverted"
  | "sunmoondfc"
  | "companion"
  | "showcase"
  | "extendedart"
  | "etched"
  | "snow"
  | "lesson"
  | "shatteredglass"
  | "convertdfc"
  | "fandfc"
  | "upsidedowndfc";

export type CardFrame = "1993" | "1997" | "2003" | "2015" | "future";

export type CardBorderColor =
  | "black"
  | "white"
  | "borderless"
  | "silver"
  | "gold";

export type CardSecurityStamp =
  | "oval"
  | "triangle"
  | "acorn"
  | "circle"
  | "arena";

export type CardFinish = "nonfoil" | "foil" | "etched" | "glossy";

export type CardGames = "paper" | "arena" | "mtgo";

export type CardLegality = "legal" | "not_legal" | "restricted" | "banned";

export type CardImageSizes =
  | "small"
  | "normal"
  | "large"
  | "png"
  | "art_crop"
  | "border_crop";

export type CardPrices = {
  usd?: string;
  usd_foil?: string;
  usd_etched?: string;
  eur?: string;
  eur_foil?: string;
  tix?: string;
};

export type CardPreview = {
  source: string;
  source_uri?: string;
  previewed_at: string;
};

export type RelatedCardComponent =
  | "token"
  | "meld_part"
  | "meld_result"
  | "combo_piece";

export type RelatedCard = {
  object: "related_card";
  id: string;
  component: RelatedCardComponent;
  name: string;
  type_line: string;
  uri: string;
};

export type Card = {
  object: "card";
  id: string;
  oracle_id: string;
  multiverse_ids?: number[];
  mtgo_id?: number;
  arena_id?: number;
  tcgplayer_id?: number;
  cardmarket_id?: number;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: CardLayout;
  highres_image: boolean;
  image_status: "missing" | "placeholder" | "lowres" | "highres_scan";
  card_faces?: CardFace[];
  image_uris?: Record<CardImageSizes, string>;
  mana_cost?: string;
  cmc: number;
  type_line?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  colors?: CardColor[];
  color_identity: CardColor[];
  keywords: string[];
  legalities: Record<string, CardLegality>;
  games: CardGames[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: CardFinish[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: CardRarity;
  flavor_text?: string;
  card_back_id?: string;
  artist?: string;
  artist_ids?: string[];
  illustration_id?: string;
  border_color: CardBorderColor;
  frame: CardFrame;
  frame_effects?: CardFrameEffect[];
  security_stamp?: CardSecurityStamp;
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  edhrec_rank?: number;
  preview?: CardPreview;
  prices: CardPrices;
  related_uris?: Record<string, string>;
  purchase_uris?: Record<string, string>;
  all_parts?: RelatedCard[];
};

export type CardFace = {
  object: "card_face";
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  colors?: CardColor[];
  power?: string;
  toughness?: string;
  flavor_text?: string;
  artist?: string;
  artist_id?: string;
  illustration_id?: string;
  image_uris?: Record<CardImageSizes, string>;
};
