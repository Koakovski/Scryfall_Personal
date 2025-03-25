import { useState } from "react";
import Grid from "./components/Grid";
import GridItem from "./components/GridItem";
import CardItem from "./components/Card";
import { CardEntity } from "./domain/entities/card.entity";
import AddCardButton from "./components/AddCardButton";

const App = () => {
  const [cards, setCards] = useState<CardEntity[]>([]);

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
