export class ScryfallEndPoint {
  static searchCards() {
    return "/cards/search";
  }

  static namedCard() {
    return "/cards/named";
  }

  static cardById(id: string) {
    return `/cards/${id}`;
  }

  static sets() {
    return "/sets";
  }
}
