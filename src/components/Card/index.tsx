import { FC } from "react";
import { Card } from "../../services/scryfall-api/types/card";

type CardItemProps = {
  card: Card;
};

const CardItem: FC<CardItemProps> = ({ card }) => {
  const alt = `${card.name} (${card.set_name} #${card.collector_number})`;

  let src = './assets/magic_card_back.png';
  if (card.card_faces && card.card_faces.length > 0) {
    const faceWithUri = card.card_faces.find((face) => face.image_uris?.normal);
    if (faceWithUri) {
      src = faceWithUri.image_uris!.normal;
    }
  }

  if (card.image_uris?.normal) {
    src = card.image_uris.normal;
  }

  return (
    <div className="w-full h-full flex flex-col items-center">
      <img src={src} alt={alt} className="w-full h-auto rounded-lg" />
    </div>
  );
};

export default CardItem;
