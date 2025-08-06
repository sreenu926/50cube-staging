import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Navigation
      home: "Home",
      leagues: "Leagues",
      readers: "Readers",
      leaderboard: "Leaderboard",

      // Common
      loading: "Loading...",
      error: "Something went wrong",
      submit: "Submit",
      cancel: "Cancel",
      buy: "Buy",
      download: "Download",

      // Leagues
      joinLeague: "Join League",
      leagueRules: "League Rules",
      myRank: "My Rank",

      // Readers
      readerLibrary: "My Library",
      buyReader: "Buy Reader",
      credits: "Credits",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
