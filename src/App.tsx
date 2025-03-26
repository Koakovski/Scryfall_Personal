import { useState } from "react";
import Grid from "./components/Grid";
import GridItem from "./components/GridItem";
import CardItem from "./components/Card";
import { CardEntity } from "./domain/entities/card.entity";
import AddCardButton from "./components/AddCardButton";
import SearchCardModal from "./components/SearchCardModal";

const App = () => {
  const [cards, setCards] = useState<CardEntity[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function onSelectCard(card: CardEntity) {
    setCards((prev) => [card, ...prev]);
  }

  return (
    <>
      {isOpen && (
        <SearchCardModal
          close={() => {
            setIsOpen(false);
          }}
          onSelectCard={onSelectCard}
        />
      )}

      <div className="mr-30 ml-30">
        <Grid gridCols="4">
          <GridItem key={"add_card_button"}>
            <AddCardButton onClick={() => setIsOpen(true)} />
          </GridItem>
          {cards.map((card) => (
            <GridItem key={card.id}>
              <CardItem card={card} />
            </GridItem>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default App;
