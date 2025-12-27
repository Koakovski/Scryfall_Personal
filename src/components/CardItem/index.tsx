import { FC, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";

type CardItemProps = {
  card: CardEntity;
  /** Controle externo do flip - se fornecido, ignora o estado interno */
  isFlipped?: boolean;
  /** Callback quando o estado de flip muda */
  onFlipChange?: (isFlipped: boolean) => void;
};

const CardItem: FC<CardItemProps> = ({
  card,
  isFlipped: externalIsFlipped,
  onFlipChange,
}) => {
  const [internalIsFlipped, setInternalIsFlipped] = useState(false);
  const alt = `${card.name} (${card.setName} #${card.collectorNumber})`;

  // Usa controle externo se fornecido, senão usa interno
  const isFlipped = externalIsFlipped ?? internalIsFlipped;

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFlipped;
    if (onFlipChange) {
      onFlipChange(newState);
    } else {
      setInternalIsFlipped(newState);
    }
  };

  // Carta simples (sem dupla face)
  if (!card.isDoubleFaced) {
    return (
      <div className="w-full h-full flex flex-col items-center">
        <img
          src={card.normalImageUri}
          alt={alt}
          className="w-full h-auto rounded-lg"
        />
      </div>
    );
  }

  // Carta double-faced com flip animation
  return (
    <div className="w-full h-full flex flex-col items-center relative group/card">
      {/* Container 3D para flip */}
      <div
        className="w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Face frontal */}
          <img
            src={card.normalImageUri}
            alt={`${alt} - Frente`}
            className="w-full h-auto rounded-lg"
            style={{
              backfaceVisibility: "hidden",
            }}
          />

          {/* Face traseira */}
          <img
            src={card.backImageUri}
            alt={`${alt} - Verso`}
            className="w-full h-auto rounded-lg absolute top-0 left-0"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          />
        </div>
      </div>

      {/* Botão de flip - sempre visível em hover ou touch */}
      <button
        onClick={handleFlip}
        className="absolute bottom-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 
                   text-white rounded-full shadow-lg transition-all duration-200
                   opacity-0 group-hover/card:opacity-100 focus:opacity-100
                   z-20 backdrop-blur-sm border border-white/20"
        title={isFlipped ? "Ver frente" : "Ver verso"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default CardItem;
