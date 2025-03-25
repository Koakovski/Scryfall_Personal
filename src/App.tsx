import { useEffect, useState } from "react";
import { searchCardsService } from "./services/scryfall-api/services/cards/serch-cards.service";
import Grid from "./components/Grid";
import GridItem from "./components/GridItem";
import CardItem from "./components/Card";
import { CardEntity } from "./domain/entities/card.entity";

const App = () => {
  const [cards, setCards] = useState<CardEntity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await searchCardsService({ text: "sol" });
      if (result.success) {
        setCards(result.data.data.map((card) => CardEntity.new(card)));
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
