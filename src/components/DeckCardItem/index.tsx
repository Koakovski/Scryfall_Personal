import { FC, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";
import { TokenData } from "../../domain/entities/deck-card.entity";
import CardItem from "../CardItem";
import ChangeCardVariationModal from "../ChangeCardVariationModal";
import CustomArtModal, { CustomArtType } from "../CustomArtModal";

/** Dados de um token com arte customizada para exibição */
export interface TokenDisplayData {
  card: CardEntity;
  customImageUri?: string;
}

type DeckCardItemProps = {
  card: CardEntity;
  quantity: number;
  tokens?: CardEntity[];
  /** Dados completos dos tokens com arte customizada */
  tokensData?: TokenData[];
  customImageUri?: string;
  customBackImageUri?: string;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onChangeCard: (newCard: CardEntity) => void;
  onChangeToken?: (tokenIndex: number, newToken: CardEntity) => void;
  onSetAsCover?: () => void;
  onSetCustomArt?: (imageUri: string) => void;
  onRemoveCustomArt?: () => void;
  onSetCustomBackArt?: (imageUri: string) => void;
  onRemoveCustomBackArt?: () => void;
  onSetTokenCustomArt?: (tokenIndex: number, imageUri: string) => void;
  onRemoveTokenCustomArt?: (tokenIndex: number) => void;
  isCoverCard?: boolean;
  preferredSet?: { code: string; name: string } | null;
};

type CustomArtModalState = {
  type: CustomArtType;
  tokenIndex?: number;
  tokenName?: string;
  originalImageUri: string;
  currentCustomArt?: string;
} | null;

const DeckCardItem: FC<DeckCardItemProps> = ({
  card,
  quantity,
  tokens = [],
  tokensData = [],
  customImageUri,
  customBackImageUri,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onChangeCard,
  onChangeToken,
  onSetAsCover,
  onSetCustomArt,
  onRemoveCustomArt,
  onSetCustomBackArt,
  onRemoveCustomBackArt,
  onSetTokenCustomArt,
  onRemoveTokenCustomArt,
  isCoverCard = false,
  preferredSet,
}) => {
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [customArtModal, setCustomArtModal] = useState<CustomArtModalState>(null);
  const [isTokensListOpen, setIsTokensListOpen] = useState(false);
  const [tokenToChange, setTokenToChange] = useState<{ token: CardEntity; index: number } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // Verifica se algum token tem arte customizada
  const hasAnyCustomArt = customImageUri || customBackImageUri || tokensData.some(t => t.customImageUri);

  // Obtém a imagem de exibição de um token (customizada ou original)
  const getTokenDisplayUri = (index: number): string => {
    const tokenData = tokensData[index];
    if (tokenData?.customImageUri) return tokenData.customImageUri;
    return tokens[index]?.normalImageUri ?? "";
  };

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

      {customArtModal && (
        <CustomArtModal
          card={card}
          originalImageUri={customArtModal.originalImageUri}
          currentCustomArt={customArtModal.currentCustomArt}
          artType={customArtModal.type}
          tokenName={customArtModal.tokenName}
          close={() => setCustomArtModal(null)}
          onSetCustomArt={(imageUri) => {
            if (customArtModal.type === "front" && onSetCustomArt) {
              onSetCustomArt(imageUri);
            } else if (customArtModal.type === "back" && onSetCustomBackArt) {
              onSetCustomBackArt(imageUri);
            } else if (customArtModal.type === "token" && onSetTokenCustomArt && customArtModal.tokenIndex !== undefined) {
              onSetTokenCustomArt(customArtModal.tokenIndex, imageUri);
            }
            setCustomArtModal(null);
          }}
          onRemoveCustomArt={() => {
            if (customArtModal.type === "front" && onRemoveCustomArt) {
              onRemoveCustomArt();
            } else if (customArtModal.type === "back" && onRemoveCustomBackArt) {
              onRemoveCustomBackArt();
            } else if (customArtModal.type === "token" && onRemoveTokenCustomArt && customArtModal.tokenIndex !== undefined) {
              onRemoveTokenCustomArt(customArtModal.tokenIndex);
            }
            setCustomArtModal(null);
          }}
        />
      )}

      <div key={card.id} className="relative cursor-pointer group">
        <CardItem 
          card={card} 
          isFlipped={isFlipped} 
          onFlipChange={setIsFlipped} 
          customImageUri={customImageUri} 
          customBackImageUri={customBackImageUri}
        />

        {/* Badges no canto superior direito - sempre visíveis */}
        <div className="absolute top-1 right-1 flex items-center gap-1 z-[5]">
          {/* Indicador de arte customizada (qualquer tipo) */}
          {hasAnyCustomArt && (
            <div
              className="bg-gradient-to-br from-pink-500 to-rose-600 
                         text-white w-5 h-5 rounded-full 
                         flex items-center justify-center shadow-md border border-white/80"
              title={`Arte customizada${customImageUri ? " (frente)" : ""}${customBackImageUri ? " (verso)" : ""}${tokensData.some(t => t.customImageUri) ? " (tokens)" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* Indicador de carta de capa */}
          {isCoverCard && (
            <div
              className="bg-gradient-to-br from-emerald-500 to-teal-600 
                         text-white w-5 h-5 rounded-full 
                         flex items-center justify-center shadow-md border border-white/80"
              title="Carta de capa do deck"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
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
                         text-white w-5 h-5 rounded-full 
                         flex items-center justify-center shadow-md border border-white/80
                         hover:from-indigo-400 hover:to-violet-500 transition-all"
              title={isFlipped ? "Ver frente" : "Ver verso"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Badge de quantidade */}
          <div
            className="bg-gradient-to-br from-amber-500 to-orange-600 
                       text-white font-bold text-[10px] min-w-5 h-5 px-1 rounded-full 
                       flex items-center justify-center shadow-md border border-white/80"
          >
            {quantity}
          </div>
        </div>

        {/* Badge de tokens - mostra quantidade de tokens */}
        {tokens.length > 0 && (
          <div className="absolute top-1 left-1 z-[5]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsTokensListOpen(!isTokensListOpen);
              }}
              className="bg-gradient-to-br from-purple-500 to-fuchsia-600 
                         text-white font-bold text-[10px] h-5 px-1.5 rounded-full 
                         flex items-center gap-1 shadow-md border border-white/80
                         hover:from-purple-400 hover:to-fuchsia-500 transition-all"
              title="Ver tokens"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
              <span>{tokens.length}</span>
            </button>

            {/* Lista flutuante de tokens */}
            {isTokensListOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 bg-slate-900/95 backdrop-blur-sm 
                           border border-slate-600 rounded-lg shadow-2xl p-2.5 z-[6]
                           min-w-[180px] max-w-[240px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
                  <h4 className="text-white font-semibold text-xs flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                    </svg>
                    Tokens
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTokensListOpen(false);
                    }}
                    className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white 
                               hover:bg-slate-700 rounded transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
                  {tokens.map((token, index) => {
                    const tokenCustomArt = tokensData[index]?.customImageUri;
                    return (
                      <div
                        key={`${token.id}-${index}`}
                        className="flex items-center gap-2 p-1.5 bg-slate-800/80 rounded-lg 
                                   hover:bg-slate-700/80 transition-colors group/token relative"
                      >
                        {/* Indicador de arte customizada no token */}
                        {tokenCustomArt && (
                          <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-br from-pink-500 to-rose-600 
                                          rounded-full flex items-center justify-center border border-white/80 z-10 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <img
                          src={getTokenDisplayUri(index)}
                          alt={token.name}
                          className="w-10 h-auto rounded shadow-md flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">
                            {token.name}
                          </p>
                          <p className="text-slate-400 text-[10px] truncate">
                            {token.setName}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/token:opacity-100 transition-all">
                          {/* Botão de arte customizada do token */}
                          {onSetTokenCustomArt && onRemoveTokenCustomArt && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomArtModal({
                                  type: "token",
                                  tokenIndex: index,
                                  tokenName: token.name,
                                  originalImageUri: token.normalImageUri,
                                  currentCustomArt: tokenCustomArt,
                                });
                                setIsTokensListOpen(false);
                              }}
                              className={`w-6 h-6 flex items-center justify-center text-white rounded-md transition-all ${
                                tokenCustomArt 
                                  ? "bg-pink-500/90 hover:bg-pink-500" 
                                  : "bg-slate-600/90 hover:bg-slate-500"
                              }`}
                              title={tokenCustomArt ? "Editar arte customizada" : "Adicionar arte customizada"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                          {onChangeToken && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTokenToChange({ token, index });
                                setIsTokensListOpen(false);
                              }}
                              className="w-6 h-6 flex items-center justify-center bg-purple-500/90 text-white 
                                         rounded-md hover:bg-purple-500 transition-all"
                              title="Trocar versão do token"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* Botão flip para cartas double-faced */}
            {card.isDoubleFaced && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(!isFlipped);
                }}
                className="h-7 px-2.5 bg-indigo-600/90 text-white text-xs font-medium rounded-md shadow-lg 
                           hover:bg-indigo-500 hover:scale-105 transform transition-all duration-150
                           flex items-center gap-1.5 justify-center border border-indigo-400/50"
                title={isFlipped ? "Ver frente" : "Ver verso"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Virar</span>
              </button>
            )}

            {/* Botão trocar versão */}
            <button
              onClick={handleChangeVersion}
              className="h-7 px-2.5 bg-slate-700/90 text-slate-200 text-xs font-medium rounded-md shadow-lg 
                         hover:bg-slate-600 hover:scale-105 transform transition-all duration-150
                         flex items-center gap-1.5 justify-center border border-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <span>Versão</span>
            </button>

            {/* Botão definir como capa */}
            {onSetAsCover && !isCoverCard && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetAsCover();
                }}
                className="h-7 px-2.5 bg-emerald-600/90 text-white text-xs font-medium rounded-md shadow-lg 
                           hover:bg-emerald-500 hover:scale-105 transform transition-all duration-150
                           flex items-center gap-1.5 justify-center border border-emerald-400/50"
                title="Definir como capa do deck"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Capa</span>
              </button>
            )}

            {/* Botão arte customizada (frente) */}
            {onSetCustomArt && onRemoveCustomArt && !isFlipped && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomArtModal({
                    type: "front",
                    originalImageUri: card.normalImageUri,
                    currentCustomArt: customImageUri,
                  });
                }}
                className={`h-7 px-2.5 text-xs font-medium rounded-md shadow-lg 
                           hover:scale-105 transform transition-all duration-150
                           flex items-center gap-1.5 justify-center ${
                             customImageUri
                               ? "bg-pink-600/90 text-white border border-pink-400/50 hover:bg-pink-500"
                               : "bg-slate-600/90 text-slate-200 border border-slate-500 hover:bg-slate-500"
                           }`}
                title={customImageUri ? "Editar arte customizada" : "Adicionar arte customizada"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                <span>Arte</span>
              </button>
            )}

            {/* Botão arte customizada (verso) - só aparece quando flipado */}
            {card.isDoubleFaced && onSetCustomBackArt && onRemoveCustomBackArt && isFlipped && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomArtModal({
                    type: "back",
                    originalImageUri: card.backImageUri ?? "",
                    currentCustomArt: customBackImageUri,
                  });
                }}
                className={`h-7 px-2.5 text-xs font-medium rounded-md shadow-lg 
                           hover:scale-105 transform transition-all duration-150
                           flex items-center gap-1.5 justify-center ${
                             customBackImageUri
                               ? "bg-pink-600/90 text-white border border-pink-400/50 hover:bg-pink-500"
                               : "bg-slate-600/90 text-slate-200 border border-slate-500 hover:bg-slate-500"
                           }`}
                title={customBackImageUri ? "Editar arte do verso" : "Adicionar arte do verso"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                <span>Verso</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DeckCardItem;
