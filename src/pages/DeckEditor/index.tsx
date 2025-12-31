import { FC, useState, useEffect, useMemo } from "react";
import Grid from "../../components/Grid";
import GridItem from "../../components/GridItem";
import { CardEntity, CardType, CARD_TYPES } from "../../domain/entities/card.entity";
import { DeckCardEntity } from "../../domain/entities/deck-card.entity";
import { PreferredSetEntity } from "../../domain/entities/preferred-set.entity";
import SearchCardModal from "../../components/SearchCardModal";
import DeckCardItem from "../../components/DeckCardItem";
import SetAutocomplete from "../../components/SetAutocomplete";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { deckStorageService } from "../../services/local-storage";
import { downloadDeckAsZip } from "../../services/deck-download";
import { downloadDeckAsPdf, PDF_FORMATS, PdfFormat } from "../../services/deck-download-pdf";

/** Mapeamento de tipos para ícones e cores */
const TYPE_CONFIG: Record<CardType, { icon: string; label: string; color: string }> = {
  Creature: { icon: "🐉", label: "Criaturas", color: "from-green-500/20 to-green-600/10 border-green-500/30" },
  Planeswalker: { icon: "✨", label: "Planeswalkers", color: "from-amber-500/20 to-amber-600/10 border-amber-500/30" },
  Battle: { icon: "⚔️", label: "Batalhas", color: "from-red-500/20 to-red-600/10 border-red-500/30" },
  Artifact: { icon: "⚙️", label: "Artefatos", color: "from-slate-400/20 to-slate-500/10 border-slate-400/30" },
  Enchantment: { icon: "🔮", label: "Encantamentos", color: "from-purple-500/20 to-purple-600/10 border-purple-500/30" },
  Instant: { icon: "⚡", label: "Mágicas Instantâneas", color: "from-blue-500/20 to-blue-600/10 border-blue-500/30" },
  Sorcery: { icon: "📜", label: "Feitiços", color: "from-rose-500/20 to-rose-600/10 border-rose-500/30" },
  Land: { icon: "🏔️", label: "Terrenos", color: "from-amber-700/20 to-amber-800/10 border-amber-700/30" },
  Other: { icon: "❓", label: "Outros", color: "from-slate-600/20 to-slate-700/10 border-slate-600/30" },
};

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(deck.name);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showPdfFormatDropdown, setShowPdfFormatDropdown] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    current: number;
    total: number;
    currentCard: string;
  } | null>(null);
  const [downloadPdfProgress, setDownloadPdfProgress] = useState<{
    current: number;
    total: number;
    currentCard: string;
  } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<CardType>>(new Set());

  const toggleSection = (type: CardType) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  useEffect(() => {
    setCards(deck.cards);
    setEditingSet(
      deck.preferredSet
        ? { code: deck.preferredSet.code, name: deck.preferredSet.name }
        : null
    );
    setEditingName(deck.name);
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

  const saveDeckName = () => {
    const trimmedName = editingName.trim();
    if (!trimmedName) return;

    const updatedDeck = DeckEntity.fromData({
      ...deck.toData(),
      name: trimmedName,
      updatedAt: new Date().toISOString(),
    });
    deckStorageService.saveDeck(updatedDeck);
    onDeckUpdate(updatedDeck);
    setIsEditingName(false);
  };

  const handleCancelNameEdit = () => {
    setIsEditingName(false);
    setEditingName(deck.name);
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

  const onSetCustomArt = (cardIndex: number, imageUri: string) => {
    const updatedCardsList = [...cards];
    updatedCardsList[cardIndex] = cards[cardIndex].withCustomArt(imageUri);
    setCards(updatedCardsList);
    saveDeck(updatedCardsList);
  };

  const onRemoveCustomArt = (cardIndex: number) => {
    const updatedCardsList = [...cards];
    updatedCardsList[cardIndex] = cards[cardIndex].removeCustomArt();
    setCards(updatedCardsList);
    saveDeck(updatedCardsList);
  };

  const handleSetAsCover = (cardId: string) => {
    const updatedDeck = DeckEntity.fromData({
      ...deck.toData(),
      coverCardId: cardId,
      updatedAt: new Date().toISOString(),
    });
    deckStorageService.saveDeck(updatedDeck);
    onDeckUpdate(updatedDeck);
  };

  /** Agrupa as cartas por tipo principal */
  const cardsByType = useMemo(() => {
    const grouped = new Map<CardType, { deckCard: DeckCardEntity; originalIndex: number }[]>();
    
    // Inicializa os grupos na ordem dos tipos
    for (const type of [...CARD_TYPES, "Other" as const]) {
      grouped.set(type, []);
    }
    
    cards.forEach((deckCard, originalIndex) => {
      const mainType = deckCard.card.mainType;
      grouped.get(mainType)?.push({ deckCard, originalIndex });
    });
    
    // Remove grupos vazios e retorna como array
    return Array.from(grouped.entries()).filter(([, cards]) => cards.length > 0);
  }, [cards]);

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

  const handleDownloadPdf = async (format: PdfFormat) => {
    if (cards.length === 0) return;
    
    setShowPdfFormatDropdown(false);
    setIsDownloadingPdf(true);
    setDownloadPdfProgress(null);
    
    try {
      // Recria o deck atual para garantir que temos os dados mais recentes
      const currentDeck = DeckEntity.fromData({
        ...deck.toData(),
        cards: cards.map((c) => c.toData()),
      });
      
      await downloadDeckAsPdf(currentDeck, format, (progress) => {
        setDownloadPdfProgress(progress);
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsDownloadingPdf(false);
      setDownloadPdfProgress(null);
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
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex-shrink-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveDeckName();
                    if (e.key === "Escape") handleCancelNameEdit();
                  }}
                  className="px-2 py-1 bg-slate-900/80 border border-amber-500/50 rounded-md text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  autoFocus
                />
                <button
                  onClick={saveDeckName}
                  disabled={!editingName.trim()}
                  className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancelNameEdit}
                  className="px-2 py-1 bg-slate-600 text-white text-xs font-medium rounded hover:bg-slate-500 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="group flex items-center gap-1.5 cursor-pointer"
                title="Clique para editar o nome"
              >
                <h2 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {deck.name}
                </h2>
                <span className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity text-sm">
                  ✏️
                </span>
              </div>
            )}
            <p className="text-xs text-slate-400">
              {cards.reduce((sum, c) => sum + c.quantity, 0)} cartas no deck (
              {cards.length} únicas)
            </p>
          </div>

          {/* Coleção preferencial e Download */}
          <div className="flex items-center gap-2">
            {isEditingSet ? (
              <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-md border border-purple-500/30">
                <SetAutocomplete
                  value={editingSet}
                  onChange={setEditingSet}
                  placeholder="Buscar coleção..."
                  className="w-56"
                />
                <button
                  onClick={savePreferredSet}
                  className="px-2 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1.5 bg-slate-600 text-white text-xs font-medium rounded hover:bg-slate-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsEditingSet(true)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
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
                
                {/* Botão de Exportar JSON */}
                <button
                  onClick={() => deckStorageService.downloadDeckAsJson(deck)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30"
                  title="Exportar deck como JSON"
                >
                  <span>📄</span>
                  JSON
                </button>

                {/* Botão de Download ZIP */}
                <button
                  onClick={handleDownloadDeck}
                  disabled={isDownloading || cards.length === 0}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isDownloading
                      ? "bg-emerald-600/40 text-emerald-300 border border-emerald-500/40"
                      : cards.length === 0
                      ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30"
                  }`}
                  title={cards.length === 0 ? "Adicione cartas para baixar" : "Baixar imagens do deck em ZIP"}
                >
                  {isDownloading ? (
                    <>
                      <svg
                        className="animate-spin h-3 w-3"
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
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      ZIP
                    </>
                  )}
                </button>

                {/* Botão de Download PDF A4 com Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => !isDownloadingPdf && cards.length > 0 && setShowPdfFormatDropdown(!showPdfFormatDropdown)}
                    disabled={isDownloadingPdf || cards.length === 0}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isDownloadingPdf
                        ? "bg-amber-600/40 text-amber-300 border border-amber-500/40"
                        : cards.length === 0
                        ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                        : "bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30"
                    }`}
                    title={cards.length === 0 ? "Adicione cartas para baixar" : "Baixar PDF para impressão A4"}
                  >
                    {isDownloadingPdf ? (
                      <>
                        <svg
                          className="animate-spin h-3 w-3"
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
                        {downloadPdfProgress
                          ? `${downloadPdfProgress.current}/${downloadPdfProgress.total}`
                          : "Gerando PDF..."}
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        PDF A4
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-3 w-3 transition-transform ${showPdfFormatDropdown ? "rotate-180" : ""}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Dropdown de formatos */}
                  {showPdfFormatDropdown && (
                    <>
                      {/* Overlay para fechar o dropdown ao clicar fora */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowPdfFormatDropdown(false)}
                      />
                      <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-800 border border-slate-600 rounded-md shadow-xl z-20 overflow-hidden">
                        <div className="p-1.5 border-b border-slate-700">
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            Escolha o formato
                          </span>
                        </div>
                        {PDF_FORMATS.map((format) => (
                          <button
                            key={format.id}
                            onClick={() => handleDownloadPdf(format.id)}
                            className="w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors flex flex-col gap-0.5 cursor-pointer"
                          >
                            <span className="text-xs font-medium text-white">
                              {format.label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {format.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards por Seções de Tipo */}
      <div className="max-w-7xl mx-auto px-4 py-4 pb-24 space-y-6">
        {cards.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🃏</div>
            <p className="text-slate-400 text-lg">Seu deck está vazio</p>
            <p className="text-slate-500 text-sm mt-1">Clique no botão + para adicionar cartas</p>
          </div>
        ) : (
          cardsByType.map(([type, cardsOfType]) => {
            const config = TYPE_CONFIG[type];
            const totalQuantity = cardsOfType.reduce((sum, { deckCard }) => sum + deckCard.quantity, 0);
            const isCollapsed = collapsedSections.has(type);
            
            return (
              <section key={type} className="space-y-3">
                {/* Header da seção - clicável para minimizar */}
                <button
                  onClick={() => toggleSection(type)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gradient-to-r ${config.color} border backdrop-blur-sm cursor-pointer hover:brightness-110 transition-all`}
                >
                  {/* Ícone de expandir/colapsar */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xl">{config.icon}</span>
                  <h3 className="text-white font-semibold text-sm">
                    {config.label}
                  </h3>
                  <span className="text-slate-400 text-xs">
                    ({totalQuantity} {totalQuantity === 1 ? "carta" : "cartas"})
                  </span>
                </button>
                
                {/* Grid de cartas - com animação de colapso */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"
                  }`}
                >
                  <Grid gridCols="4">
                    {cardsOfType.map(({ deckCard, originalIndex }) => (
                      <GridItem key={`${deckCard.cardId}-${originalIndex}`}>
                        <DeckCardItem
                          card={deckCard.card}
                          quantity={deckCard.quantity}
                          tokens={deckCard.tokens}
                          customImageUri={deckCard.customImageUri}
                          onIncreaseQuantity={() => onIncreaseQuantity(originalIndex)}
                          onDecreaseQuantity={() => onDecreaseQuantity(originalIndex)}
                          onChangeCard={(newCard) => onChangeCard(originalIndex, newCard)}
                          onChangeToken={(tokenIndex, newToken) => onChangeToken(originalIndex, tokenIndex, newToken)}
                          onSetAsCover={() => handleSetAsCover(deckCard.cardId)}
                          onSetCustomArt={(imageUri) => onSetCustomArt(originalIndex, imageUri)}
                          onRemoveCustomArt={() => onRemoveCustomArt(originalIndex)}
                          isCoverCard={deck.coverCardId === deckCard.cardId}
                          preferredSet={deck.preferredSet ? { code: deck.preferredSet.code, name: deck.preferredSet.name } : null}
                        />
                      </GridItem>
                    ))}
                  </Grid>
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Botão Flutuante de Adicionar Carta */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 
                   text-white text-3xl font-bold rounded-full shadow-2xl shadow-amber-900/50
                   hover:from-amber-400 hover:to-orange-500 hover:scale-110 
                   active:scale-95 transition-all duration-200 z-50
                   flex items-center justify-center cursor-pointer
                   ring-4 ring-amber-500/20"
        title="Adicionar carta"
      >
        +
      </button>
    </div>
  );
};

export default DeckEditor;
