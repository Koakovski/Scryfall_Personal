import { FC, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { getCardByNameService } from "../../services/scryfall-api/services/cards/get-card-by-name.service";
import Loader from "../Loader";

type ImportDeckModalProps = {
  close: () => void;
  onDeckImported: (deck: DeckEntity) => void;
};

type ImportProgress = {
  total: number;
  current: number;
  currentCard: string;
  foundCards: CardEntity[];
  notFoundCards: string[];
};

type ImportState = "idle" | "importing" | "finished";

const ImportDeckModal: FC<ImportDeckModalProps> = ({ close, onDeckImported }) => {
  const [deckName, setDeckName] = useState("");
  const [cardList, setCardList] = useState("");
  const [importState, setImportState] = useState<ImportState>("idle");
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalDeck, setFinalDeck] = useState<DeckEntity | null>(null);

  const parseCardList = (text: string): { quantity: number; name: string }[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const cards: { quantity: number; name: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Tenta parsear formato "4 Lightning Bolt" ou "4x Lightning Bolt"
      const match = trimmed.match(/^(\d+)x?\s+(.+)$/i);
      if (match) {
        const quantity = parseInt(match[1], 10);
        const name = match[2].trim();
        cards.push({ quantity, name });
      } else {
        // Se não tiver quantidade, assume 1
        cards.push({ quantity: 1, name: trimmed });
      }
    }

    return cards;
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleImport = async () => {
    if (!deckName.trim()) {
      setError("Por favor, informe o nome do deck");
      return;
    }

    if (!cardList.trim()) {
      setError("Por favor, informe a lista de cartas");
      return;
    }

    setError(null);
    setImportState("importing");

    const parsedCards = parseCardList(cardList);
    const totalCards = parsedCards.reduce((sum, c) => sum + c.quantity, 0);

    setProgress({
      total: totalCards,
      current: 0,
      currentCard: "",
      foundCards: [],
      notFoundCards: [],
    });

    const foundCards: CardEntity[] = [];
    const notFoundCards: string[] = [];
    let processedCount = 0;

    for (const { quantity, name } of parsedCards) {
      setProgress((prev) => ({
        ...prev!,
        currentCard: name,
      }));

      // Busca a carta uma vez
      const result = await getCardByNameService(name);

      if (result.success) {
        const cardEntity = CardEntity.new(result.data);
        // Adiciona a quantidade solicitada
        for (let i = 0; i < quantity; i++) {
          foundCards.push(cardEntity);
          processedCount++;
          setProgress((prev) => ({
            ...prev!,
            current: processedCount,
            foundCards: [...foundCards],
          }));
        }
      } else {
        notFoundCards.push(`${quantity > 1 ? `${quantity}x ` : ""}${name}`);
        processedCount += quantity;
        setProgress((prev) => ({
          ...prev!,
          current: processedCount,
          notFoundCards: [...notFoundCards],
        }));
      }

      // Delay para respeitar rate limit da API do Scryfall (10 req/s)
      await delay(100);
    }

    setProgress((prev) => ({
      ...prev!,
      currentCard: "",
    }));

    if (foundCards.length > 0) {
      const deck = DeckEntity.new(deckName.trim(), foundCards);
      setFinalDeck(deck);
    }

    setImportState("finished");
  };

  const handleConfirmImport = () => {
    if (finalDeck) {
      onDeckImported(finalDeck);
    }
  };

  const handleReset = () => {
    setImportState("idle");
    setProgress(null);
    setFinalDeck(null);
  };

  const progressPercentage = progress
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={importState !== "importing" ? close : undefined}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white">Importar Deck por Lista</h2>
          <p className="text-sm text-slate-400 mt-1">
            Cole uma lista de cartas no formato "4 Lightning Bolt" ou "Lightning Bolt"
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {importState === "idle" && (
            <div className="space-y-4">
              {/* Deck Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Deck
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Ex: Mono Red Aggro"
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                />
              </div>

              {/* Card List */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Lista de Cartas
                </label>
                <textarea
                  value={cardList}
                  onChange={(e) => setCardList(e.target.value)}
                  placeholder={`4 Lightning Bolt
4 Monastery Swiftspear
4 Goblin Guide
20 Mountain`}
                  rows={12}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 font-mono text-sm resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {importState === "importing" && (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Importando cartas...</span>
                  <span>
                    {progress?.current || 0} / {progress?.total || 0} ({progressPercentage}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {progress?.currentCard && (
                  <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                    <Loader />
                    Buscando: {progress.currentCard}
                  </p>
                )}
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 gap-4">
                {/* Found Cards */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <span>✓</span> Encontradas ({progress?.foundCards.length || 0})
                  </h4>
                  <div className="max-h-32 overflow-auto text-sm text-slate-300 space-y-1">
                    {[...new Set(progress?.foundCards.map((c) => c.name))].map((name, i) => (
                      <p key={i}>{name}</p>
                    ))}
                  </div>
                </div>

                {/* Not Found Cards */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                    <span>✗</span> Não encontradas ({progress?.notFoundCards.length || 0})
                  </h4>
                  <div className="max-h-32 overflow-auto text-sm text-slate-300 space-y-1">
                    {progress?.notFoundCards.map((name, i) => (
                      <p key={i}>{name}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {importState === "finished" && (
            <div className="space-y-6">
              {/* Summary Message */}
              {finalDeck ? (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h3 className="text-green-400 font-semibold text-lg flex items-center gap-2">
                    <span>✓</span> Importação concluída!
                  </h3>
                  <p className="text-slate-300 mt-1">
                    O deck "<span className="text-white font-medium">{finalDeck.name}</span>" foi criado com{" "}
                    <span className="text-green-400 font-medium">{finalDeck.cardCount} cartas</span>.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h3 className="text-red-400 font-semibold text-lg flex items-center gap-2">
                    <span>✗</span> Nenhuma carta encontrada
                  </h3>
                  <p className="text-slate-300 mt-1">
                    Não foi possível encontrar nenhuma das cartas na lista. Verifique os nomes e tente novamente.
                  </p>
                </div>
              )}

              {/* Final Results */}
              <div className="grid grid-cols-2 gap-4">
                {/* Found Cards */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
                    <span>✓</span> Encontradas ({progress?.foundCards.length || 0})
                  </h4>
                  <div className="max-h-48 overflow-auto text-sm text-slate-300 space-y-1">
                    {[...new Set(progress?.foundCards.map((c) => c.name))].map((name, i) => (
                      <p key={i}>{name}</p>
                    ))}
                    {(progress?.foundCards.length || 0) === 0 && (
                      <p className="text-slate-500 italic">Nenhuma carta encontrada</p>
                    )}
                  </div>
                </div>

                {/* Not Found Cards */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                    <span>✗</span> Não encontradas ({progress?.notFoundCards.length || 0})
                  </h4>
                  <div className="max-h-48 overflow-auto text-sm text-slate-300 space-y-1">
                    {progress?.notFoundCards.map((name, i) => (
                      <p key={i}>{name}</p>
                    ))}
                    {(progress?.notFoundCards.length || 0) === 0 && (
                      <p className="text-slate-500 italic">Todas as cartas foram encontradas!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
          {importState === "idle" && (
            <>
              <button
                onClick={close}
                className="px-5 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-900/30 cursor-pointer"
              >
                Importar Deck
              </button>
            </>
          )}

          {importState === "importing" && (
            <button
              disabled
              className="px-5 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-lg opacity-50 cursor-not-allowed"
            >
              Aguarde...
            </button>
          )}

          {importState === "finished" && (
            <>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-all cursor-pointer"
              >
                Tentar Novamente
              </button>
              {finalDeck ? (
                <button
                  onClick={handleConfirmImport}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/30 cursor-pointer"
                >
                  Salvar Deck
                </button>
              ) : (
                <button
                  onClick={close}
                  className="px-5 py-2.5 bg-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-500 transition-all cursor-pointer"
                >
                  Fechar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportDeckModal;

