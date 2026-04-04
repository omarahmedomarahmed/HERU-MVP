// Legacy pages config — no longer used by App.jsx (routes defined directly there).
// Kept for reference only. All routing is in src/App.jsx.

import Home from './pages/Home';

export const PAGES = {
  "Home": Home,
};

export const pagesConfig = {
  mainPage: "Home",
  Pages: PAGES,
  Layout: null,
};
