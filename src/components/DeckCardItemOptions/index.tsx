import { FC, useEffect, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import CardItem from "../CardItem";

type DeckCardItemOptionsProps = {
  card: CardEntity;
  onDeleteCard: (card: CardEntity) => void;
};

const DeckCardItemOptions: FC<DeckCardItemOptionsProps> = ({
  card,
  onDeleteCard,
}) => {
  const [clickCount, setClickCount] = useState(0);

  const handleCardClick = () => {
    setClickCount((prevCount) => prevCount + 1);
  };

  const resetClickCount = () => {
    setClickCount(0);
  };

  useEffect(() => {
    if (clickCount >= 2) {
      onDeleteCard(card);
    }
  }, [clickCount, card, onDeleteCard]);

  return (
    <div className="relative" onMouseLeave={resetClickCount}>
      <div
        className="flex justify-center items-center h-full"
        onClick={handleCardClick}
      >
        <div
          className={`${
            clickCount === 1 ? "bg-red-800 opacity-20" : "transparent"
          } absolute inset-0`}
        />
        <CardItem card={card} />
      </div>
    </div>
  );
};

export default DeckCardItemOptions;
