import { useState } from "react";
import Header from "./components/Header";
import DeckSelection from "./pages/DeckSelection";
import DeckEditor from "./pages/DeckEditor";
import { DeckEntity } from "./domain/entities/deck.entity";

type Page = "selection" | "editor";

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>("selection");
  const [selectedDeck, setSelectedDeck] = useState<DeckEntity | null>(null);

  const handleSelectDeck = (deck: DeckEntity) => {
    setSelectedDeck(deck);
    setCurrentPage("editor");
  };

  const handleNavigate = (page: Page) => {
    if (page === "editor" && !selectedDeck) return;
    setCurrentPage(page);
  };

  const handleDeckUpdate = (updatedDeck: DeckEntity) => {
    setSelectedDeck(updatedDeck);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        deckName={selectedDeck?.name}
      />

      {currentPage === "selection" && (
        <DeckSelection onSelectDeck={handleSelectDeck} />
      )}

      {currentPage === "editor" && selectedDeck && (
        <DeckEditor deck={selectedDeck} onDeckUpdate={handleDeckUpdate} />
      )}
    </div>
  );
};

export default App;
