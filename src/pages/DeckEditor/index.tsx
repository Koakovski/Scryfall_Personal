import { FC, useState, useEffect } from "react";
import Grid from "../../components/Grid";
import GridItem from "../../components/GridItem";
import { CardEntity } from "../../domain/entities/card.entity";
import { DeckCardEntity } from "../../domain/entities/deck-card.entity";
import AddCardButton from "../../components/AddCardButton";
import SearchCardModal from "../../components/SearchCardModal";
import DeckCardItem from "../../components/DeckCardItem";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { deckStorageService } from "../../services/local-storage";

type DeckEditorProps = {
  deck: DeckEntity;
  onDeckUpdate: (deck: DeckEntity) => void;
};

const DeckEditor: FC<DeckEditorProps> = ({ deck, onDeckUpdate }) => {
  const [cards, setCards] = useState<DeckCardEntity[]>(deck.cards);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setCards(deck.cards);
  }, [deck]);

  const saveDeck = (updatedCards: DeckCardEntity[]) => {
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
    // Verifica se a carta já existe no deck
    const existingIndex = cards.findIndex((c) => c.cardId === card.id);
    
    if (existingIndex !== -1) {
      // Aumenta a quantidade da carta existente
      const updatedCards = [...cards];
      updatedCards[existingIndex] = updatedCards[existingIndex].increaseQuantity();
      setCards(updatedCards);
      saveDeck(updatedCards);
    } else {
      // Adiciona nova carta com quantidade 1
      const newDeckCard = DeckCardEntity.new(card, 1);
      const newCards = [newDeckCard, ...cards];
      setCards(newCards);
      saveDeck(newCards);
    }
  }

  const onIncreaseQuantity = (index: number) => {
    const updatedCards = [...cards];
    updatedCards[index] = updatedCards[index].increaseQuantity();
    setCards(updatedCards);
    saveDeck(updatedCards);
  };

  const onDecreaseQuantity = (index: number) => {
    const currentCard = cards[index];
    if (currentCard.quantity <= 1) {
      // Remove a carta se a quantidade for 1
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
      saveDeck(newCards);
    } else {
      // Diminui a quantidade
      const updatedCards = [...cards];
      updatedCards[index] = updatedCards[index].decreaseQuantity();
      setCards(updatedCards);
      saveDeck(updatedCards);
    }
  };

  const onChangeCard = (index: number, newCard: CardEntity) => {
    const updatedCardsList = [...cards];
    // Usa withCardVariation para alterar apenas a versão da carta
    updatedCardsList[index] = cards[index].withCardVariation(newCard);
    setCards(updatedCardsList);
    saveDeck(updatedCardsList);
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
            <p className="text-sm text-slate-400">
              {cards.reduce((sum, c) => sum + c.quantity, 0)} cartas no deck ({cards.length} únicas)
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="p-6 max-w-7xl mx-auto">
        <Grid gridCols="4">
          <GridItem key={"add_card_button"}>
            <AddCardButton onClick={() => setIsOpen(true)} />
          </GridItem>
          {cards.map((deckCard, index) => (
            <GridItem key={`${deckCard.cardId}-${index}`}>
              <DeckCardItem
                card={deckCard.card}
                quantity={deckCard.quantity}
                onIncreaseQuantity={() => onIncreaseQuantity(index)}
                onDecreaseQuantity={() => onDecreaseQuantity(index)}
                onChangeCard={(newCard) => onChangeCard(index, newCard)}
              />
            </GridItem>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default DeckEditor;

