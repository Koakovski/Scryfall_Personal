import { FC, useEffect, useRef, useState } from "react";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { PreferredSetEntity } from "../../domain/entities/preferred-set.entity";
import { deckStorageService } from "../../services/local-storage";
import ImportDeckModal from "../../components/ImportDeckModal";
import SetAutocomplete from "../../components/SetAutocomplete";

type DeckSelectionProps = {
  onSelectDeck: (deck: DeckEntity) => void;
  onDeckDeleted: (deckId: string) => void;
};

const DeckSelection: FC<DeckSelectionProps> = ({ onSelectDeck, onDeckDeleted }) => {
  const [decks, setDecks] = useState<DeckEntity[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [preferredSet, setPreferredSet] = useState<{ code: string; name: string } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonMessage, setImportJsonMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = () => {
    const savedDecks = deckStorageService.getAllDecks();
    setDecks(savedDecks);
  };

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;

    const preferredSetEntity = preferredSet
      ? PreferredSetEntity.new(preferredSet.code, preferredSet.name)
      : undefined;

    const newDeck = DeckEntity.new(newDeckName.trim(), [], preferredSetEntity);
    deckStorageService.saveDeck(newDeck);
    setNewDeckName("");
    setPreferredSet(null);
    setIsCreating(false);
    loadDecks();
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewDeckName("");
    setPreferredSet(null);
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

  const handleExportAllDecks = () => {
    if (decks.length === 0) {
      setImportJsonMessage({ type: "error", text: "Não há decks para exportar." });
      setTimeout(() => setImportJsonMessage(null), 3000);
      return;
    }
    deckStorageService.downloadAllDecksAsJson();
    setImportJsonMessage({ type: "success", text: `${decks.length} deck(s) exportado(s) com sucesso!` });
    setTimeout(() => setImportJsonMessage(null), 3000);
  };

  const handleImportJsonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = deckStorageService.importDecksFromJson(content);
      
      if (result.imported > 0) {
        setImportJsonMessage({ 
          type: "success", 
          text: `${result.imported} deck(s) importado(s) com sucesso!${result.errors > 0 ? ` (${result.errors} erro(s))` : ""}` 
        });
        loadDecks();
      } else {
        setImportJsonMessage({ 
          type: "error", 
          text: "Erro ao importar decks. Verifique se o arquivo é válido." 
        });
      }
      setTimeout(() => setImportJsonMessage(null), 4000);
    };
    reader.readAsText(file);
    
    // Reset input para permitir importar o mesmo arquivo novamente
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">Meus Decks</h2>
          <p className="text-slate-400 text-sm">Selecione um deck para editar ou crie um novo</p>
        </div>

        {/* Create Deck Card */}
        <div className="mb-6 relative z-10">
          {isCreating ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 shadow-xl">
              <h3 className="text-base font-semibold text-white mb-3">Criar Novo Deck</h3>
              <div className="space-y-3">
                {/* Nome do deck */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nome do Deck
                  </label>
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateDeck()}
                    placeholder="Ex: Mono Red Aggro"
                    className="w-full px-3 py-2 bg-slate-900/80 border border-slate-600 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
                    autoFocus
                  />
                </div>

                {/* Coleção preferencial (opcional) */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Coleção Preferencial{" "}
                    <span className="text-slate-500">(opcional)</span>
                  </label>
                  <p className="text-[10px] text-slate-500 mb-1.5">
                    Novas cartas adicionadas usarão esta coleção quando disponível.
                  </p>
                  <SetAutocomplete
                    value={preferredSet}
                    onChange={setPreferredSet}
                    placeholder="Buscar coleção pelo nome..."
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleCreateDeck}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-md hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-900/30 cursor-pointer"
                  >
                    Criar Deck
                  </button>
                  <button
                    onClick={handleCancelCreate}
                    className="px-4 py-2 bg-slate-700 text-slate-300 text-sm font-semibold rounded-md hover:bg-slate-600 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Botões principais */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex-1 py-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
                  <span className="text-sm font-medium">Criar Novo Deck</span>
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex-1 py-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                  <span className="text-sm font-medium">Importar por Lista</span>
                </button>
              </div>
              
              {/* Botões de Export/Import JSON */}
              <div className="flex gap-3">
                <button
                  onClick={handleExportAllDecks}
                  className="flex-1 py-3 border border-slate-600 rounded-lg text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">📤</span>
                  <span className="text-sm font-medium">Exportar Decks (JSON)</span>
                </button>
                <button
                  onClick={handleImportJsonClick}
                  className="flex-1 py-3 border border-slate-600 rounded-lg text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">📥</span>
                  <span className="text-sm font-medium">Importar Decks (JSON)</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json,application/json"
                  className="hidden"
                />
              </div>

              {/* Mensagem de feedback */}
              {importJsonMessage && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium text-center ${
                    importJsonMessage.type === "success"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-red-500/20 text-red-300 border border-red-500/30"
                  }`}
                >
                  {importJsonMessage.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🎴</div>
            <p className="text-slate-400 text-base">Você ainda não tem nenhum deck.</p>
            <p className="text-slate-500 text-sm">Crie seu primeiro deck para começar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => onSelectDeck(deck)}
                className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 cursor-pointer hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-900/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-base shadow-md">
                    🃏
                  </div>
                  <button
                    onClick={(e) => handleDeleteDeck(deck.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                    title="Excluir deck"
                  >
                    🗑️
                  </button>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors">
                  {deck.name}
                </h3>
                <div className="flex flex-col gap-0.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span>📇</span> {deck.totalCardCount} cartas ({deck.uniqueCardCount} únicas)
                  </span>
                  {deck.preferredSet && (
                    <span className="flex items-center gap-1 text-purple-400">
                      <span>📦</span> {deck.preferredSet.name} ({deck.preferredSet.code.toUpperCase()})
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-[10px] text-slate-500">
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
