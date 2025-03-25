export interface List<D> {
  object: "list";
  data: Array<D>;
  has_more: boolean;
  next_page: string;
  total_cards: number;
}
