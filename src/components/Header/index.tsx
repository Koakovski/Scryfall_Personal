import { FC } from "react";

type HeaderProps = {
  currentPage: "selection" | "editor";
  onNavigate: (page: "selection" | "editor") => void;
  deckName?: string;
};

const Header: FC<HeaderProps> = ({ currentPage, onNavigate, deckName }) => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-500/30 shadow-lg shadow-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo / Brand */}
          <button
            onClick={() => onNavigate("selection")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-md">
              <span className="text-base">🃏</span>
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent tracking-tight">
              Scryfall Personal
            </h1>
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigate("selection")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                currentPage === "selection"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner"
                  : "text-slate-300 hover:text-amber-300 hover:bg-white/5"
              }`}
            >
              📚 Meus Decks
            </button>
            <button
              onClick={() => onNavigate("editor")}
              disabled={!deckName}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                currentPage === "editor"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner"
                  : "text-slate-300 hover:text-amber-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-300"
              }`}
            >
              ✏️ Editor
              {deckName && (
                <span className="ml-1.5 text-xs text-slate-400">({deckName})</span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

