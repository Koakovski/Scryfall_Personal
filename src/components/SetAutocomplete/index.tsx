import { FC, useState, useEffect, useRef, useMemo } from "react";
import { getAllSetsService } from "../../services/scryfall-api/services/sets/get-all-sets.service";
import { Set, SetType } from "../../services/scryfall-api/types/set";

// Mapeamento de nomes amigáveis para os tipos de set
const setTypeLabels: Record<SetType, string> = {
  core: "Coleções Principais",
  expansion: "Expansões",
  masters: "Masters",
  alchemy: "Alchemy",
  masterpiece: "Masterpiece",
  arsenal: "Arsenal",
  from_the_vault: "From the Vault",
  spellbook: "Spellbook",
  premium_deck: "Premium Deck",
  duel_deck: "Duel Deck",
  draft_innovation: "Draft Innovation",
  treasure_chest: "Treasure Chest",
  commander: "Commander",
  planechase: "Planechase",
  archenemy: "Archenemy",
  vanguard: "Vanguard",
  funny: "Funny / Un-Sets",
  starter: "Starter",
  box: "Box Sets",
  promo: "Promos",
  token: "Tokens",
  memorabilia: "Memorabilia",
  minigame: "Minigame",
  eternal: "Eternal",
};

// Ordem de prioridade dos tipos de set
const setTypeOrder: SetType[] = [
  "expansion",
  "core",
  "masters",
  "eternal",
  "draft_innovation",
  "commander",
  "alchemy",
  "masterpiece",
  "arsenal",
  "from_the_vault",
  "spellbook",
  "premium_deck",
  "duel_deck",
  "planechase",
  "archenemy",
  "vanguard",
  "starter",
  "box",
  "funny",
  "promo",
  "token",
  "memorabilia",
  "treasure_chest",
  "minigame",
];

type GroupedSets = {
  type: SetType;
  label: string;
  sets: Set[];
}[];

type SetAutocompleteProps = {
  value: { code: string; name: string } | null;
  onChange: (set: { code: string; name: string } | null) => void;
  placeholder?: string;
  className?: string;
};

const SetAutocomplete: FC<SetAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Buscar coleção...",
  className = "",
}) => {
  const [query, setQuery] = useState(value?.name || "");
  const [allSets, setAllSets] = useState<Set[]>([]);
  const [filteredSets, setFilteredSets] = useState<Set[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Carrega todos os sets ao montar o componente
  useEffect(() => {
    const loadSets = async () => {
      setLoading(true);
      const result = await getAllSetsService();
      if (result.success) {
        // Filtra apenas sets com cartas e ordena por data de lançamento (mais recentes primeiro)
        const validSets = result.data.data
          .filter((set) => set.card_count > 0)
          .sort(
            (a, b) =>
              new Date(b.released_at).getTime() -
              new Date(a.released_at).getTime()
          );
        setAllSets(validSets);
      }
      setLoading(false);
    };
    loadSets();
  }, []);

  // Atualiza o query quando o value muda externamente
  useEffect(() => {
    setQuery(value?.name || "");
  }, [value]);

  // Filtra os sets baseado na query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredSets(allSets.slice(0, 50)); // Mostra os 50 mais recentes se não tiver busca
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = allSets.filter(
        (set) =>
          set.name.toLowerCase().includes(lowerQuery) ||
          set.code.toLowerCase().includes(lowerQuery)
      );
      setFilteredSets(filtered.slice(0, 50));
    }
    setHighlightedIndex(0);
  }, [query, allSets]);

  // Agrupa os sets filtrados por tipo
  const groupedSets: GroupedSets = useMemo(() => {
    const groups: Record<SetType, Set[]> = {} as Record<SetType, Set[]>;
    
    for (const set of filteredSets) {
      if (!groups[set.set_type]) {
        groups[set.set_type] = [];
      }
      groups[set.set_type].push(set);
    }

    return setTypeOrder
      .filter((type) => groups[type]?.length > 0)
      .map((type) => ({
        type,
        label: setTypeLabels[type],
        sets: groups[type],
      }));
  }, [filteredSets]);

  // Cria lista flat para navegação por teclado
  const flatSets = useMemo(() => {
    return groupedSets.flatMap((group) => group.sets);
  }, [groupedSets]);

  const handleSelect = (set: Set) => {
    onChange({ code: set.code, name: set.name });
    setQuery(set.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < flatSets.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (flatSets[highlightedIndex]) {
          handleSelect(flatSets[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Scroll para o item destacado
  useEffect(() => {
    if (isOpen && listRef.current && flatSets[highlightedIndex]) {
      const highlightedElement = listRef.current.querySelector(
        `[data-set-id="${flatSets[highlightedIndex].id}"]`
      ) as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen, flatSets]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay para permitir clique na lista
            setTimeout(() => setIsOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 pr-10"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-[9999] w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-64 overflow-auto"
        >
          {loading ? (
            <div className="px-4 py-3 text-slate-400 text-center">
              Carregando coleções...
            </div>
          ) : groupedSets.length === 0 ? (
            <div className="px-4 py-3 text-slate-400 text-center">
              Nenhuma coleção encontrada
            </div>
          ) : (
            groupedSets.map((group) => (
              <div key={group.type}>
                {/* Header do grupo */}
                <div className="px-4 py-2 bg-slate-900/80 text-xs font-semibold text-purple-400 uppercase tracking-wider sticky top-0 border-b border-slate-700">
                  {group.label}
                </div>
                {/* Sets do grupo */}
                {group.sets.map((set) => {
                  const flatIndex = flatSets.findIndex((s) => s.id === set.id);
                  return (
                    <button
                      key={set.id}
                      type="button"
                      data-set-id={set.id}
                      onClick={() => handleSelect(set)}
                      title={set.name}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors cursor-pointer ${
                        flatIndex === highlightedIndex
                          ? "bg-purple-600/30 text-white"
                          : "text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      <img
                        src={set.icon_svg_uri}
                        alt={set.name}
                        className="w-6 h-6 object-contain"
                        style={{ filter: "invert(1)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{set.name}</p>
                        <p className="text-xs text-slate-500">
                          {set.code.toUpperCase()} • {set.card_count} cartas •{" "}
                          {new Date(set.released_at).getFullYear()}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SetAutocomplete;

