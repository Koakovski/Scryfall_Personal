import { useEffect, useState } from "react";
import Grid from "./components/Grid";
import GridItem from "./components/GridItem";
import { CardEntity } from "./domain/entities/card.entity";
import AddCardButton from "./components/AddCardButton";
import SearchCardModal from "./components/SearchCardModal";
import { searchCardsService } from "./services/scryfall-api/services/cards/serch-cards.service";
import DeckCardItemOptions from "./components/DeckCardItemOptions";

const App = () => {
  const [cards, setCards] = useState<CardEntity[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function onSelectCard(card: CardEntity) {
    setCards((prev) => [card, ...prev]);
  }

  const onDeleteCard = (card: CardEntity) => {
    setCards((prev) => prev.filter((currCard) => currCard.id !== card.id));
  };

  const onChangeCard = (oldCard: CardEntity, newCard: CardEntity) => {
    setCards((prevCards) => {
      const cardIndex = prevCards.findIndex((card) => card.id === oldCard.id);

      if (cardIndex !== -1) {
        const updatedCardsList = [...prevCards];
        updatedCardsList[cardIndex] = newCard;
        return updatedCardsList;
      } else {
        return prevCards;
      }
    });
  };

/*   useEffect(() => {
    (async () => {
      // POPULATE THE ARRAY TO TESTS
      const result = await searchCardsService({ text: "signet" });
      if (result.success) {
        setCards(result.data.data.map((card) => CardEntity.new(card)));
      }
    })();
  }, []); */

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
              <DeckCardItemOptions
                card={card}
                onDeleteCard={onDeleteCard}
                onChangeCard={onChangeCard}
              />
            </GridItem>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default App;
