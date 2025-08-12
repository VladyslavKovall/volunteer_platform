import { loadEvents } from "./events.js";

export function setupEventFormModal() {
  const showEventFormBtn = document.getElementById("showEventFormBtn");
  const eventForm = document.getElementById("eventForm");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const backdrop = document.getElementById("modalBackdrop");
  const modal = document.getElementById("eventModal");

  showEventFormBtn.addEventListener("click", () => {
    eventForm.reset();
    eventForm.elements.eventId.value = "";
    backdrop.style.display = "block";
    modal.style.display = "block";
  });

  cancelEditBtn.addEventListener("click", () => {
    backdrop.style.display = "none";
    modal.style.display = "none";
    eventForm.reset();
  });

  eventForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(eventForm);
    const eventId = formData.get("eventId");
    const method = eventId ? "PUT" : "POST";
    const url = eventId
      ? `http://localhost:3000/events/${eventId}`
      : `http://localhost:3000/events`;

    const data = {
      title: formData.get("title"),
      date: formData.get("date"),
      location: formData.get("location"),
      description: formData.get("description"),
    };

    try {
      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      backdrop.style.display = "none";
      modal.style.display = "none";
      eventForm.reset();
      loadEvents();
    } catch (err) {
      alert("Помилка при збереженні події");
    }
  });
}
