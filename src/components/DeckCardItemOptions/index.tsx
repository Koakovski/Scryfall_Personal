import { FC, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import CardItem from "../CardItem";
import ChangeCardVariationModal from "../ChangeCardVariationModal";

type DeckCardItemOptionsProps = {
  card: CardEntity;
  onDeleteCard: () => void;
  onChangeCard: (newCard: CardEntity) => void;
};

const DeckCardItemOptions: FC<DeckCardItemOptionsProps> = ({
  card,
  onDeleteCard,
  onChangeCard,
}) => {
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteCard();
  };

  const handleChangeVersion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVersionModalOpen(true);
  };

  return (
    <>
      {isVersionModalOpen && (
        <ChangeCardVariationModal
          card={card}
          close={() => setIsVersionModalOpen(false)}
          onChangeCard={(_, newCard) => onChangeCard(newCard)}
        />
      )}

      <div
        key={card.id}
        className="relative cursor-pointer group"
      >
        <CardItem card={card} />

        {/* Overlay escuro quando hover */}
        <div
          className="absolute inset-0 bg-black rounded-lg transition-opacity duration-200 pointer-events-none opacity-0 group-hover:opacity-60"
        />

        {/* Botões de ação */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
        >
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-lg 
                       hover:bg-red-600 hover:scale-105 transform transition-all duration-150
                       flex items-center gap-2 min-w-[140px] justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Apagar
          </button>

          <button
            onClick={handleChangeVersion}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-lg 
                       hover:bg-blue-600 hover:scale-105 transform transition-all duration-150
                       flex items-center gap-2 min-w-[140px] justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Trocar Versão
          </button>
        </div>
      </div>
    </>
  );
};

export default DeckCardItemOptions;
