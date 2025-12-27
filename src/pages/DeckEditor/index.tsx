import { FC, useState, useEffect } from "react";
import Grid from "../../components/Grid";
import GridItem from "../../components/GridItem";
import { CardEntity } from "../../domain/entities/card.entity";
import AddCardButton from "../../components/AddCardButton";
import SearchCardModal from "../../components/SearchCardModal";
import DeckCardItemOptions from "../../components/DeckCardItemOptions";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { deckStorageService } from "../../services/local-storage";

type DeckEditorProps = {
  deck: DeckEntity;
  onDeckUpdate: (deck: DeckEntity) => void;
};

const DeckEditor: FC<DeckEditorProps> = ({ deck, onDeckUpdate }) => {
  const [cards, setCards] = useState<CardEntity[]>(deck.cards);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setCards(deck.cards);
  }, [deck]);

  const saveDeck = (updatedCards: CardEntity[]) => {
    // Recria o deck com as cartas atualizadas
    const updatedDeck = DeckEntity.fromData({
      ...deck.toData(),
      cards: updatedCards.map((c) => c.toData()),
      updatedAt: new Date().toISOString(),
    });
    deckStorageService.saveDeck(updatedDeck);
    onDeckUpdate(updatedDeck);
  };

  function onSelectCard(card: CardEntity) {
    const newCards = [card, ...cards];
    setCards(newCards);
    saveDeck(newCards);
  }

  const onDeleteCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
    saveDeck(newCards);
  };

  const onChangeCard = (oldCard: CardEntity, newCard: CardEntity) => {
    const cardIndex = cards.findIndex((card) => card.id === oldCard.id);

    if (cardIndex !== -1) {
      const updatedCardsList = [...cards];
      updatedCardsList[cardIndex] = newCard;
      setCards(updatedCardsList);
      saveDeck(updatedCardsList);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      {isOpen && (
        <SearchCardModal
          close={() => {
            setIsOpen(false);
          }}
          onSelectCard={onSelectCard}
        />
      )}

      {/* Deck Info Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{deck.name}</h2>
            <p className="text-sm text-slate-400">{cards.length} cartas no deck</p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-6 max-w-7xl mx-auto">
        <Grid gridCols="4">
          <GridItem key={"add_card_button"}>
            <AddCardButton onClick={() => setIsOpen(true)} />
          </GridItem>
          {cards.map((card, index) => (
            <GridItem key={`${card.id}-${index}`}>
              <DeckCardItemOptions
                card={card}
                onDeleteCard={() => onDeleteCard(index)}
                onChangeCard={onChangeCard}
              />
            </GridItem>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default DeckEditor;

