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
import { downloadDeckAsZip } from "../../services/deck-download";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
    currentCard: string;
  } | null>(null);

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

  function onSelectCard(card: CardEntity, tokens?: CardEntity[]) {
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
      // Adiciona nova carta com quantidade 1 e seus tokens
      const newDeckCard = DeckCardEntity.new(card, 1, tokens);
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

  const onChangeToken = (cardIndex: number, tokenIndex: number, newToken: CardEntity) => {
    const updatedCardsList = [...cards];
    // Usa withTokenVariation para alterar apenas a versão do token
    updatedCardsList[cardIndex] = cards[cardIndex].withTokenVariation(tokenIndex, newToken);
    setCards(updatedCardsList);
    saveDeck(updatedCardsList);
  };

  const handleDownloadDeck = async () => {
    if (cards.length === 0) return;
    
    setIsDownloading(true);
    setDownloadProgress(null);
    
    try {
      // Recria o deck atual para garantir que temos os dados mais recentes
      const currentDeck = DeckEntity.fromData({
        ...deck.toData(),
        cards: cards.map((c) => c.toData()),
      });
      
      await downloadDeckAsZip(currentDeck, (progress) => {
        setDownloadProgress(progress);
      });
    } catch (error) {
      console.error("Erro ao baixar deck:", error);
      alert("Erro ao baixar o deck. Tente novamente.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
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
          preferredSet={deck.preferredSet}
        />
      )}

      {/* Deck Info Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <h2 className="text-xl font-bold text-white">{deck.name}</h2>
            <p className="text-sm text-slate-400">
              {cards.reduce((sum, c) => sum + c.quantity, 0)} cartas no deck (
              {cards.length} únicas)
            </p>
          </div>

          {/* Coleção preferencial e Download */}
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
              <>
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
                
                {/* Botão de Download */}
                <button
                  onClick={handleDownloadDeck}
                  disabled={isDownloading || cards.length === 0}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                    isDownloading
                      ? "bg-emerald-600/40 text-emerald-300 border border-emerald-500/40"
                      : cards.length === 0
                      ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30"
                  }`}
                  title={cards.length === 0 ? "Adicione cartas para baixar" : "Baixar imagens do deck"}
                >
                  {isDownloading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {downloadProgress
                        ? `${downloadProgress.current}/${downloadProgress.total}`
                        : "Preparando..."}
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Baixar Imagens
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Grid gridCols="4">
          <GridItem key={"add_card_button"}>
            <AddCardButton onClick={() => setIsOpen(true)} />
          </GridItem>
          {cards.map((deckCard, index) => (
            <GridItem key={`${deckCard.cardId}-${index}`}>
              <DeckCardItem
                card={deckCard.card}
                quantity={deckCard.quantity}
                tokens={deckCard.tokens}
                onIncreaseQuantity={() => onIncreaseQuantity(index)}
                onDecreaseQuantity={() => onDecreaseQuantity(index)}
                onChangeCard={(newCard) => onChangeCard(index, newCard)}
                onChangeToken={(tokenIndex, newToken) => onChangeToken(index, tokenIndex, newToken)}
                preferredSet={deck.preferredSet ? { code: deck.preferredSet.code, name: deck.preferredSet.name } : null}
              />
            </GridItem>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default DeckEditor;
