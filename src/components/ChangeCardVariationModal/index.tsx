import { FC, useEffect, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import Grid from "../Grid";
import GridItem from "../GridItem";
import CardItem from "../CardItem";
import Loader from "../Loader";
import { searchCardVariationsService } from "../../services/scryfall-api/services/cards/search-card-variations.service";

type ChangeCardVariationModalProps = {
  card: CardEntity;
  close: () => void;
  onChangeCard: (oldCard: CardEntity, newCard: CardEntity) => void;
};

const ChangeCardVariationModal: FC<ChangeCardVariationModalProps> = ({
  close,
  card,
  onChangeCard,
}) => {
  const [cards, setCards] = useState<CardEntity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
  }, [card.name, card.oracleId]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        onClick={close}
      />
      <div className="relative w-[90%] h-[90%] max-w-6xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="mb-4 pb-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Selecionar Versão</h2>
          <p className="text-sm text-slate-400 mt-1">
            Escolha uma versão diferente para "{card.name}"
          </p>
        </div>

        <div className="flex-1 rounded-xl bg-slate-950/50 border border-slate-700/50 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader />
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
