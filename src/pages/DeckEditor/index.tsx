import { FC, useState, useEffect } from "react";
import Grid from "../../components/Grid";
import GridItem from "../../components/GridItem";
import { CardEntity } from "../../domain/entities/card.entity";
import { DeckCardEntity } from "../../domain/entities/deck-card.entity";
import { PreferredSetEntity } from "../../domain/entities/preferred-set.entity";
import AddCardButton from "../../components/AddCardButton";
import SearchCardModal from "../../components/SearchCardModal";
import DeckCardItem from "../../components/DeckCardItem";
import SetAutocomplete from "../../components/SetAutocomplete";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { deckStorageService } from "../../services/local-storage";

type DeckEditorProps = {
  deck: DeckEntity;
  onDeckUpdate: (deck: DeckEntity) => void;
};

const DeckEditor: FC<DeckEditorProps> = ({ deck, onDeckUpdate }) => {
  const [cards, setCards] = useState<DeckCardEntity[]>(deck.cards);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditingSet, setIsEditingSet] = useState(false);
  const [editingSet, setEditingSet] = useState<{
    code: string;
    name: string;
  } | null>(
    deck.preferredSet
      ? { code: deck.preferredSet.code, name: deck.preferredSet.name }
      : null
  );

  useEffect(() => {
    setCards(deck.cards);
    setEditingSet(
      deck.preferredSet
        ? { code: deck.preferredSet.code, name: deck.preferredSet.name }
        : null
    );
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

  const savePreferredSet = () => {
    const preferredSet = editingSet
      ? PreferredSetEntity.new(editingSet.code, editingSet.name)
      : undefined;

    const updatedDeck = DeckEntity.fromData({
      ...deck.toData(),
      preferredSet: preferredSet?.toData(),
      updatedAt: new Date().toISOString(),
    });
    deckStorageService.saveDeck(updatedDeck);
    onDeckUpdate(updatedDeck);
    setIsEditingSet(false);
  };

  const handleCancelEdit = () => {
    setIsEditingSet(false);
    setEditingSet(
      deck.preferredSet
        ? { code: deck.preferredSet.code, name: deck.preferredSet.name }
        : null
    );
  };

  function onSelectCard(card: CardEntity) {
    // Verifica se a carta já existe no deck (pelo oracleId para considerar versões diferentes)
    const existingIndex = cards.findIndex(
      (c) => c.card.oracleId === card.oracleId
    );

    if (existingIndex !== -1) {
      // Aumenta a quantidade da carta existente
      const updatedCards = [...cards];
      updatedCards[existingIndex] =
        updatedCards[existingIndex].increaseQuantity();
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
          preferredSet={deck.preferredSet}
        />
      )}

      {/* Deck Info Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <h2 className="text-xl font-bold text-white">{deck.name}</h2>
            <p className="text-sm text-slate-400">
              {cards.reduce((sum, c) => sum + c.quantity, 0)} cartas no deck (
              {cards.length} únicas)
            </p>
          </div>

          {/* Coleção preferencial */}
          <div className="flex items-center gap-3">
            {isEditingSet ? (
              <div className="flex items-center gap-2 bg-slate-900/80 p-3 rounded-lg border border-purple-500/30">
                <SetAutocomplete
                  value={editingSet}
                  onChange={setEditingSet}
                  placeholder="Buscar coleção..."
                  className="w-72"
                />
                <button
                  onClick={savePreferredSet}
                  className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-2 bg-slate-600 text-white text-sm font-medium rounded hover:bg-slate-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingSet(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                  deck.preferredSet
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                <span>📦</span>
                {deck.preferredSet
                  ? `${deck.preferredSet.name} (${deck.preferredSet.code.toUpperCase()})`
                  : "Definir Coleção"}
              </button>
            )}
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
