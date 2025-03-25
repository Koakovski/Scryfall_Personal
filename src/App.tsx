import { useEffect, useState } from "react";
import { searchCardsService } from "./services/scryfall-api/services/cards/serch-cards.service";
import { Card } from "./services/scryfall-api/types/card";

const App = () => {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await searchCardsService({ text: "sol" });
      if (result.success) {
        setCards(result.data.data);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {cards.length ? (
        <ul>
          {cards.map((card) => (
            <li key={card.id}>{card.name}</li>
          ))}
        </ul>
      ) : (
        "Carregando..."
      )}
    </div>
  );
};

export default App;
