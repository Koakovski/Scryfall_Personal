import { FC, useEffect, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import { searchCardsService } from "../../services/scryfall-api/services/cards/serch-cards.service";
import Grid from "../Grid";
import GridItem from "../GridItem";
import CardItem from "../CardItem";
import Loader from "../Loader";

type SearchCardModalProps = {
  close: () => void;
  onSelectCard: (card: CardEntity) => void;
};

const SearchCardModal: FC<SearchCardModalProps> = ({ close, onSelectCard }) => {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (text: string) => {
    setLoading(true);
    const result = await searchCardsService({ text });
    if (result.success) {
      setCards(result.data.data.map((card) => CardEntity.new(card)));
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-1000">
      <div
        className="absolute inset-0 bg-black opacity-50 cursor-pointer"
        onClick={close}
      />
      <div className="relative w-9/10 h-9/10 bg-white p-6 rounded-lg flex flex-col">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar..."
          className="w-full border-2 text-gray-500 border-gray-300 p-2 rounded-md focus:outline-none"
        />

        <div className="flex-1 mt-2 rounded-lg bg-gray-100 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          )}
          {!loading && cards.length > 0 && (
            <Grid gridCols="6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    onSelectCard(card);
                    close();
                  }}
                >
                  <GridItem key={card.id}>
                    <CardItem card={card} />
                  </GridItem>
                </div>
              ))}
            </Grid>
          )}
          {!loading && !query.trim() && cards.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Busque por um card</p>
            </div>
          )}
          {!loading && query.trim().length > 0 && cards.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Nenhum resultado encontrado</p>
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={close}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchCardModal;
