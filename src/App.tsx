import { useEffect, useState } from "react";
import Grid from "./components/Grid";
import GridItem from "./components/GridItem";
import CardItem from "./components/Card";
import { CardEntity } from "./domain/entities/card.entity";
import { searchCardsService } from "./services/scryfall-api/services/cards/serch-cards.service";
import AddCardButton from "./components/AddCardButton";

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
      <Grid>
        <GridItem key={"add_card_button"}>
          <AddCardButton />
        </GridItem>
        {cards.map((card) => (
          <GridItem key={card.id}>
            <CardItem card={card} />
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default App;
