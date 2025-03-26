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
  onChangeCard: (card: CardEntity) => void;
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
        oracleId: card.oracleId,
      });
      if (result.success) {
        setCards(result.data.data.map((card) => CardEntity.new(card)));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-1000">
      <div
        className="absolute inset-0 bg-black opacity-50 cursor-pointer"
        onClick={close}
      />
      <div className="relative w-9/10 h-9/10 bg-white p-6 rounded-lg flex flex-col">
        <div className="flex-1 mt-2 rounded-lg bg-gray-100 overflow-auto">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          )}
          {!loading && cards.length > 0 && (
            <Grid gridCols="6">
              {cards.map((card) => (
                <div
                  onClick={() => {
                    onChangeCard(card);
                    close();
                  }}
                >
                  <GridItem key={card.id}>
                    <CardItem card={card} />
                  </GridItem>
                </div>
              ))}
            </Grid>
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

export default ChangeCardVariationModal;
