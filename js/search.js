import { allEvents } from "./events.js";
import { renderEvents } from "./events.js";

export function setupSearch() {
  document.getElementById("searchInput").addEventListener("input", () => {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = allEvents.filter((event) =>
      event.title.toLowerCase().includes(query)
    );
    renderEvents(filtered);
  });
}
