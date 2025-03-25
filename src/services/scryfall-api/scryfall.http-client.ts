import HttpClient from "../http/http.client";

class ScryfallHttpClient extends HttpClient {
  constructor() {
    super("https://api.scryfall.com");
  }
}

export const scryfallHttpClient = new ScryfallHttpClient();
