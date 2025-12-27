import { FC, useEffect, useState } from "react";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { deckStorageService } from "../../services/local-storage";
import ImportDeckModal from "../../components/ImportDeckModal";

type DeckSelectionProps = {
  onSelectDeck: (deck: DeckEntity) => void;
  onDeckDeleted: (deckId: string) => void;
};

const DeckSelection: FC<DeckSelectionProps> = ({ onSelectDeck, onDeckDeleted }) => {
  const [decks, setDecks] = useState<DeckEntity[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = () => {
    const savedDecks = deckStorageService.getAllDecks();
    setDecks(savedDecks);
  };

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;

    const newDeck = DeckEntity.new(newDeckName.trim());
    deckStorageService.saveDeck(newDeck);
    setNewDeckName("");
    setIsCreating(false);
    loadDecks();
  };

  const handleDeleteDeck = (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este deck?")) {
      deckStorageService.deleteDeck(deckId);
      onDeckDeleted(deckId);
      loadDecks();
    }
  };

  const handleDeckImported = (deck: DeckEntity) => {
    deckStorageService.saveDeck(deck);
    setIsImportModalOpen(false);
    loadDecks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Meus Decks</h2>
          <p className="text-slate-400">Selecione um deck para editar ou crie um novo</p>
        </div>

        {/* Create Deck Card */}
        <div className="mb-8">
          {isCreating ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Criar Novo Deck</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateDeck()}
                  placeholder="Nome do deck..."
                  className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                  autoFocus
                />
                <button
                  onClick={handleCreateDeck}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-900/30 cursor-pointer"
                >
                  Criar
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewDeckName("");
                  }}
                  className="px-6 py-3 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => setIsCreating(true)}
                className="flex-1 py-6 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">+</span>
                <span className="text-lg font-medium">Criar Novo Deck</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex-1 py-6 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
                <span className="text-lg font-medium">Importar por Lista</span>
              </button>
            </div>
          )}
        </div>

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎴</div>
            <p className="text-slate-400 text-lg">Você ainda não tem nenhum deck.</p>
            <p className="text-slate-500">Crie seu primeiro deck para começar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => onSelectDeck(deck)}
                className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 cursor-pointer hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl shadow-md">
                    🃏
                  </div>
                  <button
                    onClick={(e) => handleDeleteDeck(deck.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                    title="Excluir deck"
                  >
                    🗑️
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  {deck.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <span>📇</span> {deck.totalCardCount} cartas ({deck.uniqueCardCount} únicas)
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500">
                    Atualizado em{" "}
                    {new Date(deck.updatedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Import Modal */}
        {isImportModalOpen && (
          <ImportDeckModal
            close={() => setIsImportModalOpen(false)}
            onDeckImported={handleDeckImported}
          />
        )}
      </div>
    </div>
  );
};

export default DeckSelection;

