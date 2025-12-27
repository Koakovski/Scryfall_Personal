import { FC, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import CardItem from "../CardItem";
import ChangeCardVariationModal from "../ChangeCardVariationModal";

type DeckCardItemOptionsProps = {
  card: CardEntity;
  onDeleteCard: () => void;
  onChangeCard: (newCard: CardEntity) => void;
  preferredSet?: { code: string; name: string } | null;
};

const DeckCardItemOptions: FC<DeckCardItemOptionsProps> = ({
  card,
  onDeleteCard,
  onChangeCard,
  preferredSet,
}) => {
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

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
          preferredSet={preferredSet}
        />
      )}

      <div
        key={card.id}
        className="relative cursor-pointer group"
      >
        <CardItem card={card} isFlipped={isFlipped} onFlipChange={setIsFlipped} />

        {/* Indicador de carta double-faced - sempre visível */}
        {card.isDoubleFaced && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
            className="absolute top-1 right-1 bg-gradient-to-br from-indigo-500 to-violet-600 
                       text-white w-5 h-5 rounded-full 
                       flex items-center justify-center shadow-md border border-white
                       hover:from-indigo-400 hover:to-violet-500 transition-all z-10"
            title={isFlipped ? "Ver frente" : "Ver verso"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
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
        )}

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

          <div className="flex items-center gap-2">
            {/* Botão flip para cartas double-faced */}
            {card.isDoubleFaced && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
                className="px-3 py-2 bg-indigo-600/90 text-white font-medium rounded-lg shadow-lg 
                           hover:bg-indigo-500 hover:scale-105 transform transition-all duration-150
                           flex items-center gap-1.5 justify-center border border-indigo-400/50"
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
                Virar
              </button>
            )}

            <button
              onClick={handleChangeVersion}
              className="px-3 py-2 bg-slate-700/90 text-slate-200 font-medium rounded-lg shadow-lg 
                         hover:bg-slate-600 hover:scale-105 transform transition-all duration-150
                         flex items-center gap-1.5 justify-center border border-slate-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Versão
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeckCardItemOptions;
