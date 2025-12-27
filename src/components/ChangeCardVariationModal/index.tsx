import { FC, useEffect, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import Grid from "../Grid";
import GridItem from "../GridItem";
import CardItem from "../CardItem";
import Loader from "../Loader";
import SetAutocomplete from "../SetAutocomplete";
import { searchCardVariationsService } from "../../services/scryfall-api/services/cards/search-card-variations.service";
import { searchCardVariationsBySetService } from "../../services/scryfall-api/services/cards/search-cards-by-set.service";

type ChangeCardVariationModalProps = {
  card: CardEntity;
  close: () => void;
  onChangeCard: (oldCard: CardEntity, newCard: CardEntity) => void;
  preferredSet?: { code: string; name: string } | null;
};

type FilterMode = "card" | "set";

const ChangeCardVariationModal: FC<ChangeCardVariationModalProps> = ({
  close,
  card,
  onChangeCard,
  preferredSet,
}) => {
  const [cards, setCards] = useState<CardEntity[]>([]);
  const [loading, setLoading] = useState(false);
  // Se tiver preferredSet, inicia no modo "set" com ele já selecionado
  const [filterMode, setFilterMode] = useState<FilterMode>(preferredSet ? "set" : "card");
  const [selectedSet, setSelectedSet] = useState<{ code: string; name: string } | null>(preferredSet || null);

  // Busca variações da carta (modo padrão)
  useEffect(() => {
    if (filterMode !== "card") return;

    const fetchData = async () => {
      setLoading(true);
      const result = await searchCardVariationsService({
        oracleId: card.oracleId || undefined,
        name: card.name,
      });
      if (result.success) {
        setCards(result.data.data.map((card) => CardEntity.new(card)));
      }
      setLoading(false);
    };

    fetchData();
  }, [card.name, card.oracleId, filterMode]);

  // Busca variações da carta na coleção selecionada
  useEffect(() => {
    if (filterMode !== "set" || !selectedSet) {
      if (filterMode === "set") {
        setCards([]);
      }
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const result = await searchCardVariationsBySetService({
        setCode: selectedSet.code,
        oracleId: card.oracleId || undefined,
        name: card.name,
      });
      if (result.success) {
        setCards(result.data.data.map((card) => CardEntity.new(card)));
      } else {
        // Se não encontrar a carta nessa coleção, limpa a lista
        setCards([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedSet, filterMode, card.oracleId, card.name]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        onClick={close}
      />
      <div className="relative w-[90%] h-[90%] max-w-6xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-slate-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Selecionar Versão</h2>
              <p className="text-sm text-slate-400 mt-1">
                {filterMode === "card"
                  ? `Escolha uma versão diferente para "${card.name}"`
                  : selectedSet
                  ? `Mostrando versões de "${card.name}" em "${selectedSet.name}"`
                  : "Selecione uma coleção para ver as versões disponíveis"}
              </p>
            </div>

            {/* Filtro por modo */}
            <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg">
              <button
                onClick={() => setFilterMode("card")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  filterMode === "card"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Por Carta
              </button>
              <button
                onClick={() => setFilterMode("set")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                  filterMode === "set"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Por Coleção
              </button>
            </div>
          </div>

          {/* Autocomplete de coleção */}
          {filterMode === "set" && (
            <div className="mt-4">
              <SetAutocomplete
                value={selectedSet}
                onChange={setSelectedSet}
                placeholder="Buscar coleção pelo nome..."
                className="w-full max-w-md"
              />
            </div>
          )}
        </div>

        <div className="flex-1 rounded-xl bg-slate-950/50 border border-slate-700/50 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          )}
          {!loading && filterMode === "set" && !selectedSet && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-lg font-medium">Selecione uma coleção</p>
              <p className="text-sm text-slate-500 mt-1">
                Use a busca acima para encontrar uma coleção
              </p>
            </div>
          )}
          {!loading && cards.length > 0 && (
            <Grid gridCols="6">
              {cards.map((cardVariation) => (
                <div
                  key={cardVariation.id}
                  onClick={() => {
                    onChangeCard(card, cardVariation);
                    close();
                  }}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <GridItem>
                    <CardItem card={cardVariation} />
                  </GridItem>
                </div>
              ))}
            </Grid>
          )}
          {!loading && cards.length === 0 && filterMode === "set" && selectedSet && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p className="text-lg font-medium">Carta não encontrada</p>
              <p className="text-sm text-slate-500 mt-1">
                "{card.name}" não está disponível na coleção "{selectedSet.name}"
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={close}
            className="px-5 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeCardVariationModal;
