import { FC, useRef, useState } from "react";
import { CardEntity } from "../../domain/entities/card.entity";

type CustomArtModalProps = {
  card: CardEntity;
  currentCustomArt?: string;
  close: () => void;
  onSetCustomArt: (imageUri: string) => void;
  onRemoveCustomArt: () => void;
};

type InputMode = "upload" | "url";

const CustomArtModal: FC<CustomArtModalProps> = ({
  card,
  currentCustomArt,
  close,
  onSetCustomArt,
  onRemoveCustomArt,
}) => {
  const [inputMode, setInputMode] = useState<InputMode>("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCustomArt ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5MB.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Erro ao ler o arquivo. Tente novamente.");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);

    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  };

  const handleUrlSubmit = () => {
    if (!imageUrl.trim()) {
      setError("Por favor, insira uma URL de imagem.");
      return;
    }

    // Validação básica de URL
    try {
      new URL(imageUrl);
    } catch {
      setError("URL inválida. Por favor, insira uma URL válida.");
      return;
    }

    setError(null);
    setIsLoading(true);

    // Testa se a imagem carrega
    const img = new Image();
    img.onload = () => {
      setPreviewUrl(imageUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      setError("Não foi possível carregar a imagem. Verifique a URL.");
      setIsLoading(false);
    };
    img.src = imageUrl;
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onSetCustomArt(previewUrl);
      close();
    }
  };

  const handleRemove = () => {
    onRemoveCustomArt();
    close();
  };

  const handleClearPreview = () => {
    setPreviewUrl(null);
    setImageUrl("");
    setError(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎨</span> Arte Customizada
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Defina uma arte personalizada para <span className="text-amber-300">{card.name}</span>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto space-y-5">
          {/* Preview da carta atual vs customizada */}
          <div className="grid grid-cols-2 gap-4">
            {/* Arte original */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Arte Original
              </label>
              <div className="relative aspect-[488/680] bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                <img
                  src={card.normalImageUri}
                  alt={`${card.name} - Original`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Arte customizada (preview) */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                {previewUrl ? "Preview Customizado" : "Sem Arte Customizada"}
              </label>
              <div className="relative aspect-[488/680] bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                  </div>
                ) : previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt={`${card.name} - Customizado`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleClearPreview}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 
                                 text-white rounded-full flex items-center justify-center 
                                 transition-colors text-sm font-bold"
                      title="Remover preview"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                    <span className="text-4xl mb-2">📷</span>
                    <span className="text-xs text-center px-4">
                      Faça upload ou cole uma URL
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seletor de modo */}
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode("upload")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer
                ${inputMode === "upload"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                  : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700"
                }`}
            >
              <span className="mr-1.5">📤</span> Upload de Arquivo
            </button>
            <button
              onClick={() => setInputMode("url")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer
                ${inputMode === "url"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                  : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700"
                }`}
            >
              <span className="mr-1.5">🔗</span> URL de Imagem
            </button>
          </div>

          {/* Input de acordo com o modo */}
          {inputMode === "upload" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 border-2 border-dashed border-slate-600 rounded-lg
                           text-slate-400 hover:text-slate-300 hover:border-slate-500 
                           transition-all cursor-pointer flex flex-col items-center gap-2"
              >
                <span className="text-3xl">📁</span>
                <span className="text-sm">
                  Clique para selecionar uma imagem
                </span>
                <span className="text-xs text-slate-500">
                  PNG, JPG, GIF ou WebP (máx. 5MB)
                </span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                placeholder="https://exemplo.com/imagem.png"
                className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-lg 
                           text-white placeholder-slate-500 focus:outline-none 
                           focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!imageUrl.trim() || isLoading}
                className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg 
                           hover:bg-amber-500 transition-colors cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Carregar
              </button>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50 flex justify-between gap-3">
          <div>
            {currentCustomArt && (
              <button
                onClick={handleRemove}
                className="px-4 py-2.5 bg-red-600/20 text-red-400 font-medium rounded-lg 
                           border border-red-500/30 hover:bg-red-600/30 transition-all cursor-pointer"
              >
                Remover Arte Customizada
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={close}
              className="px-5 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-lg 
                         hover:bg-slate-600 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!previewUrl}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white 
                         font-semibold rounded-lg hover:from-amber-400 hover:to-orange-500 
                         transition-all shadow-lg shadow-amber-900/30 cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar Arte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomArtModal;

