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
  onSetAsCover?: () => void;
  isCoverCard?: boolean;
  preferredSet?: { code: string; name: string } | null;
};

const DeckCardItem: FC<DeckCardItemProps> = ({
  card,
  quantity,
  tokens = [],
  onIncreaseQuantity,
  onDecreaseQuantity,
  onChangeCard,
  onChangeToken,
  onSetAsCover,
  isCoverCard = false,
  preferredSet,
}) => {
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isTokensListOpen, setIsTokensListOpen] = useState(false);
  const [tokenToChange, setTokenToChange] = useState<{ token: CardEntity; index: number } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

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
          preferredSet={preferredSet}
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
          preferredSet={preferredSet}
        />
      )}

      <div key={card.id} className="relative cursor-pointer group">
        <CardItem card={card} isFlipped={isFlipped} onFlipChange={setIsFlipped} />

        {/* Badges no canto superior direito - sempre visíveis */}
        <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 z-[5]">
          {/* Indicador de carta de capa */}
          {isCoverCard && (
            <div
              className="bg-gradient-to-br from-emerald-500 to-teal-600 
                         text-white w-4 h-4 rounded-full 
                         flex items-center justify-center shadow-md border border-white"
              title="Carta de capa do deck"
            >
              <span className="text-[8px]">⭐</span>
            </div>
          )}

          {/* Indicador de carta double-faced */}
          {card.isDoubleFaced && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(!isFlipped);
              }}
              className="bg-gradient-to-br from-indigo-500 to-violet-600 
                         text-white w-4 h-4 rounded-full 
                         flex items-center justify-center shadow-md border border-white
                         hover:from-indigo-400 hover:to-violet-500 transition-all"
              title={isFlipped ? "Ver frente" : "Ver verso"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-2.5 w-2.5"
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

          {/* Badge de quantidade */}
          <div
            className="bg-gradient-to-br from-amber-500 to-orange-600 
                       text-white font-bold text-[10px] w-4 h-4 rounded-full 
                       flex items-center justify-center shadow-md border border-white"
          >
            {quantity}
          </div>
        </div>

        {/* Badge de tokens - mostra quantidade de tokens */}
        {tokens.length > 0 && (
          <div className="absolute top-0.5 left-0.5 z-[5]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTokensListOpen(!isTokensListOpen);
              }}
              className="bg-gradient-to-br from-purple-500 to-fuchsia-600 
                         text-white font-bold text-[10px] px-1 py-0.5 rounded-full 
                         flex items-center gap-0.5 shadow-md border border-white
                         hover:from-purple-400 hover:to-fuchsia-500 transition-all"
              title="Ver tokens"
            >
              <span className="text-[8px]">🎭</span>
              <span>{tokens.length}</span>
            </button>

            {/* Lista flutuante de tokens */}
            {isTokensListOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 bg-slate-900/95 backdrop-blur-sm 
                           border border-slate-600 rounded-lg shadow-2xl p-2 z-[6]
                           min-w-[160px] max-w-[220px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-slate-700">
                  <h4 className="text-white font-semibold text-xs flex items-center gap-1">
                    <span>🎭</span> Tokens
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTokensListOpen(false);
                    }}
                    className="text-slate-400 hover:text-white transition-colors text-sm leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto">
                  {tokens.map((token, index) => (
                    <div
                      key={`${token.id}-${index}`}
                      className="flex items-center gap-1.5 p-1.5 bg-slate-800/80 rounded-md 
                                 hover:bg-slate-700/80 transition-colors group/token"
                    >
                      <img
                        src={token.normalImageUri}
                        alt={token.name}
                        className="w-10 h-auto rounded shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">
                          {token.name}
                        </p>
                        <p className="text-slate-400 text-[10px] truncate">
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
                          className="p-1 bg-purple-500/80 text-white rounded 
                                     hover:bg-purple-500 transition-all opacity-0 
                                     group-hover/token:opacity-100"
                          title="Trocar versão do token"
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
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 
                     transition-opacity duration-200 opacity-0 pointer-events-none 
                     group-hover:opacity-100 group-hover:pointer-events-auto"
        >
          {/* Controles de quantidade */}
          <div className="flex items-center gap-2">
            {/* Botão diminuir (ou remover se quantidade = 1) */}
            <button
              onClick={handleDecrease}
              className="w-8 h-8 bg-red-500 text-white font-bold text-base rounded-full 
                         shadow-lg hover:bg-red-600 hover:scale-110 transform transition-all 
                         duration-150 flex items-center justify-center"
              title={quantity <= 1 ? "Remover carta" : "Diminuir quantidade"}
            >
              {quantity <= 1 ? "🗑" : "−"}
            </button>

            {/* Display de quantidade central */}
            <div
              className="bg-white/90 text-gray-900 font-bold text-base px-2 py-1 
                         rounded-md shadow-lg min-w-[36px] text-center"
            >
              {quantity}
            </div>

            {/* Botão aumentar */}
            <button
              onClick={handleIncrease}
              className="w-8 h-8 bg-green-500 text-white font-bold text-base rounded-full 
                         shadow-lg hover:bg-green-600 hover:scale-110 transform transition-all 
                         duration-150 flex items-center justify-center"
              title="Aumentar quantidade"
            >
              +
            </button>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-1.5">
            {/* Botão flip para cartas double-faced */}
            {card.isDoubleFaced && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
                className="px-2 py-1.5 bg-indigo-600/90 text-white text-xs font-medium rounded-md shadow-lg 
                           hover:bg-indigo-500 hover:scale-105 transform transition-all duration-150
                           flex items-center gap-1 justify-center border border-indigo-400/50"
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
                Virar
              </button>
            )}

            {/* Botão trocar versão */}
            <button
              onClick={handleChangeVersion}
              className="px-2 py-1.5 bg-slate-700/90 text-slate-200 text-xs font-medium rounded-md shadow-lg 
                         hover:bg-slate-600 hover:scale-105 transform transition-all duration-150
                         flex items-center gap-1 justify-center border border-slate-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              Versão
            </button>

            {/* Botão definir como capa */}
            {onSetAsCover && !isCoverCard && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetAsCover();
                }}
                className="px-2 py-1.5 bg-emerald-600/90 text-white text-xs font-medium rounded-md shadow-lg 
                           hover:bg-emerald-500 hover:scale-105 transform transition-all duration-150
                           flex items-center gap-1 justify-center border border-emerald-400/50"
                title="Definir como capa do deck"
              >
                <span className="text-[10px]">⭐</span>
                Capa
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DeckCardItem;
