import { FC } from "react";
import { CardEntity } from "../../domain/entities/card.entity";

type CardItemProps = {
  card: CardEntity;
};

const CardItem: FC<CardItemProps> = ({ card }) => {
  const alt = `${card.name} (${card.setName} #${card.collectorNumber})`;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <img
        src={card.normalImageUri}
        alt={alt}
        className="w-full h-auto rounded-lg"
      />
    </div>
  );
};

export default CardItem;
