import { FC, useEffect, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import { PreferredSetEntity } from "../../domain/entities/preferred-set.entity";
import { searchCardsService } from "../../services/scryfall-api/services/cards/serch-cards.service";
import { getCardByNameAndSetService } from "../../services/scryfall-api/services/cards/get-card-by-name-and-set.service";
import { getCardTokensService } from "../../services/scryfall-api/services/cards/get-card-tokens.service";
import { Card } from "../../services/scryfall-api/types/card";
import Grid from "../Grid";
import GridItem from "../GridItem";
import CardItem from "../CardItem";
import Loader from "../Loader";

type CardWithRawData = {
  entity: CardEntity;
  rawData: Card;
};

type SearchCardModalProps = {
  close: () => void;
  onSelectCard: (card: CardEntity, tokens?: CardEntity[]) => void;
  preferredSet?: PreferredSetEntity;
};

const SearchCardModal: FC<SearchCardModalProps> = ({
  close,
  onSelectCard,
  preferredSet,
}) => {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardWithRawData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const fetchData = async (text: string) => {
    setLoading(true);
    const result = await searchCardsService({ text });
    if (result.success) {
      setCards(
        result.data.data.map((card) => ({
          entity: CardEntity.new(card),
          rawData: card,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (query.trim()) {
        fetchData(query.trim());
      } else {
        setCards([]);
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [query]);

  /**
   * Quando o usuário seleciona uma carta, tenta buscar a versão da coleção preferencial
   * e também busca os tokens associados à carta.
   */
  const handleSelectCard = async (cardWithData: CardWithRawData) => {
    if (isSelecting) return;
    setIsSelecting(true);

    let finalCard = cardWithData.entity;
    let cardForTokens = cardWithData.rawData;

    if (preferredSet) {
      // Tenta buscar a carta na coleção preferencial
      const preferredResult = await getCardByNameAndSetService(
        cardWithData.entity.name,
        preferredSet.code
      );

      if (preferredResult.success) {
        // Encontrou na coleção preferencial, usa essa versão
        finalCard = CardEntity.new(preferredResult.data);
        cardForTokens = preferredResult.data;
      }
    }

    // Busca os tokens da carta
    const tokens = await getCardTokensService(
      cardForTokens.all_parts ? cardForTokens : cardWithData.rawData,
      preferredSet?.code
    );

    onSelectCard(finalCard, tokens.length > 0 ? tokens : undefined);
    close();
    setIsSelecting(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        onClick={close}
      />
      <div className="relative w-[90%] h-[90%] max-w-6xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl flex flex-col">
        {/* Header com info da coleção preferencial */}
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar carta..."
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
          />
          {preferredSet && (
            <p className="text-sm text-purple-400 mt-2 flex items-center gap-1">
              <span>📦</span>
              Coleção preferencial:{" "}
              <span className="font-semibold">
                {preferredSet.name} ({preferredSet.code.toUpperCase()})
              </span>
            </p>
          )}
        </div>

        <div className="flex-1 rounded-xl bg-slate-950/50 border border-slate-700/50 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          )}
          {!loading && cards.length > 0 && (
            <Grid gridCols="6">
              {cards.map((cardWithData) => (
                <div
                  key={cardWithData.entity.id}
                  onClick={() => handleSelectCard(cardWithData)}
                  className={`cursor-pointer hover:scale-105 transition-transform ${isSelecting ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <GridItem key={cardWithData.entity.id}>
                    <CardItem card={cardWithData.entity} />
                  </GridItem>
                </div>
              ))}
            </Grid>
          )}
          {!loading && !query.trim() && cards.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">Busque por uma carta</p>
            </div>
          )}
          {!loading && query.trim().length > 0 && cards.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">Nenhum resultado encontrado</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={close}
            className="px-5 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchCardModal;
