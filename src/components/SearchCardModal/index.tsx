import { FC, useEffect, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import { PreferredSetEntity } from "../../domain/entities/preferred-set.entity";
import { searchCardsService } from "../../services/scryfall-api/services/cards/serch-cards.service";
import { getCardByNameAndSetService } from "../../services/scryfall-api/services/cards/get-card-by-name-and-set.service";
import Grid from "../Grid";
import GridItem from "../GridItem";
import CardItem from "../CardItem";
import Loader from "../Loader";

type SearchCardModalProps = {
  close: () => void;
  onSelectCard: (card: CardEntity) => void;
  preferredSet?: PreferredSetEntity;
};

const SearchCardModal: FC<SearchCardModalProps> = ({
  close,
  onSelectCard,
  preferredSet,
}) => {
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<CardEntity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (text: string) => {
    setLoading(true);
    const result = await searchCardsService({ text });
    if (result.success) {
      setCards(result.data.data.map((card) => CardEntity.new(card)));
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (query.trim()) {
        fetchData(query.trim());
      } else {
        setCards([]);
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [query]);

  /**
   * Quando o usuário seleciona uma carta, tenta buscar a versão da coleção preferencial.
   * Se encontrar, usa essa versão; caso contrário, usa a carta selecionada.
   */
  const handleSelectCard = async (card: CardEntity) => {
    if (preferredSet) {
      // Tenta buscar a carta na coleção preferencial
      const preferredResult = await getCardByNameAndSetService(
        card.name,
        preferredSet.code
      );

      if (preferredResult.success) {
        // Encontrou na coleção preferencial, usa essa versão
        const preferredCard = CardEntity.new(preferredResult.data);
        onSelectCard(preferredCard);
        close();
        return;
      }
    }

    // Não tem coleção preferencial ou não encontrou, usa a carta original
    onSelectCard(card);
    close();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-1000">
      <div
        className="absolute inset-0 bg-black opacity-50 cursor-pointer"
        onClick={close}
      />
      <div className="relative w-9/10 h-9/10 bg-white p-6 rounded-lg flex flex-col">
        {/* Header com info da coleção preferencial */}
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full border-2 text-gray-500 border-gray-300 p-2 rounded-md focus:outline-none"
          />
          {preferredSet && (
            <p className="text-sm text-purple-600 mt-2 flex items-center gap-1">
              <span>📦</span>
              Coleção preferencial:{" "}
              <span className="font-semibold">
                {preferredSet.name} ({preferredSet.code.toUpperCase()})
              </span>
            </p>
          )}
        </div>

        <div className="flex-1 rounded-lg bg-gray-100 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          )}
          {!loading && cards.length > 0 && (
            <Grid gridCols="6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className="cursor-pointer"
                >
                  <GridItem key={card.id}>
                    <CardItem card={card} />
                  </GridItem>
                </div>
              ))}
            </Grid>
          )}
          {!loading && !query.trim() && cards.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Busque por um card</p>
            </div>
          )}
          {!loading && query.trim().length > 0 && cards.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Nenhum resultado encontrado</p>
            </div>
          )}
        </div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={close}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchCardModal;
