import { FC, useEffect, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import CardItem from "../CardItem";
import ChangeCardVariationModal from "../ChangeCardVariationModal";

type DeckCardItemOptionsProps = {
  card: CardEntity;
  onDeleteCard: (card: CardEntity) => void;
  onChangeCard: (oldCard: CardEntity, newCard: CardEntity) => void;
};

const DeckCardItemOptions: FC<DeckCardItemOptionsProps> = ({
  card,
  onDeleteCard,
  onChangeCard,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [pressStart, setPressStart] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleCardClick = () => {
    setClickCount((prevCount) => prevCount + 1);
  };

  const resetClickCount = () => {
    setClickCount(0);
  };

  const handleMouseDown = () => {
    setPressStart(Date.now());
  };

  const handleMouseUp = () => {
    if (pressStart) {
      const pressDuration = Date.now() - pressStart;
      if (pressDuration >= 300) {
        setIsOpen(true);
      }
    }
    setPressStart(null);
  };

  useEffect(() => {
    if (clickCount >= 2) {
      onDeleteCard(card);
    }
  }, [clickCount, card, onDeleteCard]);

  return (
    <>
      {isOpen && (
        <ChangeCardVariationModal
          card={card}
          close={() => setIsOpen(false)}
          onChangeCard={onChangeCard}
        />
      )}

      <div key={card.id} className="relative" onMouseLeave={resetClickCount}>
        <div
          className="flex justify-center items-center h-full"
          onClick={handleCardClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <div
            className={`${
              clickCount === 1 ? "bg-red-800 opacity-20" : "transparent"
            } absolute inset-0`}
          />
          <CardItem card={card} />
        </div>
      </div>
    </>
  );
};

export default DeckCardItemOptions;
