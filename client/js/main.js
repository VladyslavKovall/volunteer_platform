import { setupAuth } from "./auth.js";
import { showMainPage } from "./events.js";
import { setupEventFormModal } from "./eventModal.js";
import { setupSearch } from "./search.js";

document.addEventListener("DOMContentLoaded", () => {
  setupAuth(showMainPage);
  setupEventFormModal();
  setupSearch();
});
