import { FC, useEffect, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import { searchCardsService } from "../../services/scryfall-api/services/cards/serch-cards.service";
import Grid from "../Grid";
import GridItem from "../GridItem";
import CardItem from "../Card";

type SearchCardModalProps = {
  close: () => void;
};

const SearchCardModal: FC<SearchCardModalProps> = ({ close }) => {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardEntity[]>([]);

  const fetchData = async (text: string) => {
    const result = await searchCardsService({ text });
    if (result.success) {
      setCards(result.data.data.map((card) => CardEntity.new(card)));
    }
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (query.trim()) {
        fetchData(query.trim());
      } else {
        setCards([]);
      }
    }, 300);
    return () => clearTimeout(timeOutId);
  }, [query]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-50 cursor-pointer"
        onClick={close}
      />
      <div className="relative w-9/10 h-9/10 bg-white p-6 rounded-lg flex flex-col">
        <div className="flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full border-2 text-gray-500 border-gray-300 p-2 rounded-md focus:outline-none"
          />

          <Grid gridCols="6">
            {cards.map((card) => (
              <GridItem key={card.id}>
                <CardItem card={card} />
              </GridItem>
            ))}
          </Grid>
        </div>

        <div className="mt-4 flex justify-end">
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
