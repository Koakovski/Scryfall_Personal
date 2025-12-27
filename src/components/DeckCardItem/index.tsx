import { FC, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import CardItem from "../CardItem";
import ChangeCardVariationModal from "../ChangeCardVariationModal";

type DeckCardItemProps = {
  card: CardEntity;
  quantity: number;
  tokens?: CardEntity[];
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onChangeCard: (newCard: CardEntity) => void;
  onChangeToken?: (tokenIndex: number, newToken: CardEntity) => void;
};

const DeckCardItem: FC<DeckCardItemProps> = ({
  card,
  quantity,
  tokens = [],
  onIncreaseQuantity,
  onDecreaseQuantity,
  onChangeCard,
  onChangeToken,
}) => {
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isTokensListOpen, setIsTokensListOpen] = useState(false);
  const [tokenToChange, setTokenToChange] = useState<{ token: CardEntity; index: number } | null>(null);

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

      {tokenToChange && onChangeToken && (
        <ChangeCardVariationModal
          card={tokenToChange.token}
          close={() => setTokenToChange(null)}
          onChangeCard={(_, newToken) => {
            onChangeToken(tokenToChange.index, newToken);
            setTokenToChange(null);
          }}
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

        {/* Badge de tokens - mostra quantidade de tokens */}
        {tokens.length > 0 && (
          <div className="absolute top-2 left-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTokensListOpen(!isTokensListOpen);
              }}
              className="bg-gradient-to-br from-purple-500 to-fuchsia-600 
                         text-white font-bold text-sm px-2 py-1 rounded-full 
                         flex items-center gap-1 shadow-lg border-2 border-white
                         hover:from-purple-400 hover:to-fuchsia-500 transition-all"
              title="Ver tokens"
            >
              <span>🎭</span>
              <span>{tokens.length}</span>
            </button>

            {/* Lista flutuante de tokens */}
            {isTokensListOpen && (
              <div
                className="absolute top-full left-0 mt-2 bg-slate-900/95 backdrop-blur-sm 
                           border border-slate-600 rounded-xl shadow-2xl p-3 z-50
                           min-w-[200px] max-w-[280px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
                  <h4 className="text-white font-semibold text-sm flex items-center gap-1">
                    <span>🎭</span> Tokens
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTokensListOpen(false);
                    }}
                    className="text-slate-400 hover:text-white transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {tokens.map((token, index) => (
                    <div
                      key={`${token.id}-${index}`}
                      className="flex items-center gap-2 p-2 bg-slate-800/80 rounded-lg 
                                 hover:bg-slate-700/80 transition-colors group/token"
                    >
                      <img
                        src={token.normalImageUri}
                        alt={token.name}
                        className="w-12 h-auto rounded shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {token.name}
                        </p>
                        <p className="text-slate-400 text-xs truncate">
                          {token.setName}
                        </p>
                      </div>
                      {onChangeToken && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTokenToChange({ token, index });
                            setIsTokensListOpen(false);
                          }}
                          className="p-1.5 bg-blue-500/80 text-white rounded-md 
                                     hover:bg-blue-500 transition-all opacity-0 
                                     group-hover/token:opacity-100"
                          title="Trocar versão do token"
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
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
