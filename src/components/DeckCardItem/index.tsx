import { FC, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import CardItem from "../CardItem";
import ChangeCardVariationModal from "../ChangeCardVariationModal";

type DeckCardItemProps = {
  card: CardEntity;
  quantity: number;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onChangeCard: (newCard: CardEntity) => void;
};

const DeckCardItem: FC<DeckCardItemProps> = ({
  card,
  quantity,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onChangeCard,
}) => {
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIncreaseQuantity();
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecreaseQuantity();
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

      <div key={card.id} className="relative cursor-pointer group">
        <CardItem card={card} />

        {/* Badge de quantidade - sempre visível */}
        <div
          className="absolute top-2 right-2 bg-gradient-to-br from-amber-500 to-orange-600 
                     text-white font-bold text-lg w-8 h-8 rounded-full 
                     flex items-center justify-center shadow-lg border-2 border-white
                     z-10"
        >
          {quantity}
        </div>

        {/* Overlay escuro quando hover */}
        <div
          className="absolute inset-0 bg-black rounded-lg transition-opacity duration-200 
                     pointer-events-none opacity-0 group-hover:opacity-60"
        />

        {/* Botões no hover */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 
                     transition-opacity duration-200 opacity-0 pointer-events-none 
                     group-hover:opacity-100 group-hover:pointer-events-auto"
        >
          {/* Controles de quantidade */}
          <div className="flex items-center gap-3">
            {/* Botão diminuir (ou remover se quantidade = 1) */}
            <button
              onClick={handleDecrease}
              className="w-11 h-11 bg-red-500 text-white font-bold text-xl rounded-full 
                         shadow-lg hover:bg-red-600 hover:scale-110 transform transition-all 
                         duration-150 flex items-center justify-center"
              title={quantity <= 1 ? "Remover carta" : "Diminuir quantidade"}
            >
              {quantity <= 1 ? "🗑" : "−"}
            </button>

            {/* Display de quantidade central */}
            <div
              className="bg-white/90 text-gray-900 font-bold text-xl px-3 py-1.5 
                         rounded-lg shadow-lg min-w-[50px] text-center"
            >
              {quantity}
            </div>

            {/* Botão aumentar */}
            <button
              onClick={handleIncrease}
              className="w-11 h-11 bg-green-500 text-white font-bold text-xl rounded-full 
                         shadow-lg hover:bg-green-600 hover:scale-110 transform transition-all 
                         duration-150 flex items-center justify-center"
              title="Aumentar quantidade"
            >
              +
            </button>
          </div>

          {/* Botão trocar versão */}
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

export default DeckCardItem;
