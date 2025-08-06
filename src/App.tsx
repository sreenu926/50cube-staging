import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/config";

// Page Components
import HomePage from "./pages/HomePage";
import LeaguesPage from "./pages/Leagues/LeaguesPage";
import ReadersPage from "./pages/Readers/ReadersPage";
import LeagueEntry from "./pages/Leagues/LeaguesEntry";
import Leaderboard from "./pages/Leagues/Leaderboard";
import LibraryPage from "./pages/Readers/LibraryPage";
import LeagueChallenge from "./pages/Leagues/LeagueChallenge";
import Header from "./components/layout/Header";

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />

              {/* M13 - Leagues Routes */}
              <Route path="/leagues" element={<LeaguesPage />} />
              <Route path="/leagues/:id" element={<LeagueEntry />} />
              <Route path="/leagues/:id/play" element={<LeagueChallenge />} />
              <Route
                path="/leagues/:id/leaderboard"
                element={<Leaderboard />}
              />

              {/* M15 - Readers Routes */}
              <Route path="/readers" element={<ReadersPage />} />
              <Route path="/library" element={<LibraryPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </I18nextProvider>
  );
};

export default App;
