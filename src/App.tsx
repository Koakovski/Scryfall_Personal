import { useEffect, useState } from "react";
import { searchCardsService } from "./services/scryfall-api/services/cards/serch-cards.service";
import { Card } from "./services/scryfall-api/types/card";
import Grid from "./components/Grid";
import GridItem from "./components/GridItem";
import CardItem from "./components/Card";

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
        <Grid>
          {cards.map((card) => (
            <GridItem key={card.id}>
              <CardItem card={card} />
            </GridItem>
          ))}
        </Grid>
      ) : (
        "Carregando..."
      )}
    </div>
  );
};

export default App;
