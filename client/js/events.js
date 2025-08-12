import { parseJwt } from "./utils.js";

export let allEvents = [];

export async function loadEvents() {
  try {
    const res = await fetch("http://localhost:3000/events");
    const events = await res.json();
    allEvents = events;
    renderEvents(events);
  } catch (err) {
    console.error("Помилка при завантаженні подій:", err);
  }
}

export function showMainPage() {
  document.getElementById("register").style.display = "none";
  document.getElementById("login").style.display = "none";
  document.querySelector('[data-tab="register"]').style.display = "none";
  document.querySelector('[data-tab="login"]').style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  loadEvents();
}

export function renderEvents(events) {
  const list = document.getElementById("eventsList");
  list.innerHTML = "";

  events.forEach(async (event) => {
    const li = document.createElement("li");
    const date = new Date(event.date);
    const formattedDate = date.toLocaleString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    li.innerHTML = `
      <strong>${event.title}</strong><br />
      📅 <em>${formattedDate}</em><br />
      🧭 <strong>Місце:</strong> ${event.location}<br />
      📝 <strong>Опис:</strong> ${event.description}<br />
      👤 <strong>Організатор:</strong> ${event.organizer}
      <hr />
    `;

    const token = localStorage.getItem("token");
    let isOrganizer = false;

    if (token) {
      const userData = parseJwt(token);
      isOrganizer = userData.id === event.user_id;
    }

    if (isOrganizer) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Редагувати";
      editBtn.addEventListener("click", () => {
        const form = document.getElementById("eventForm");
        document.getElementById("modalBackdrop").style.display = "block";
        document.getElementById("eventModal").style.display = "block";

        form.elements.eventId.value = event.id;
        form.elements.title.value = event.title;
        form.elements.date.value = new Date(event.date)
          .toISOString()
          .slice(0, 16);
        form.elements.location.value = event.location;
        form.elements.description.value = event.description;
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Видалити";
      deleteBtn.addEventListener("click", async () => {
        if (confirm("Ви впевнені, що хочете видалити цю подію?")) {
          try {
            const response = await fetch(
              `http://localhost:3000/events/${event.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) throw new Error("Помилка при видаленні події");
            alert("Подія успішно видалена");
            loadEvents();
          } catch (err) {
            console.error(err);
            alert("Сталася помилка при видаленні події");
          }
        }
      });

      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
    }

    const joinBtn = document.createElement("button");
    joinBtn.textContent = "Приєднатися";
    joinBtn.addEventListener("click", async () => {
      if (!token) return alert("Будь ласка, увійдіть в систему");

      try {
        const res = await fetch(
          `http://localhost:3000/events/${event.id}/register`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const result = await res.json();
        alert(result.message || "Ви приєдналися до події!");
        loadEvents();
      } catch (err) {
        alert("Помилка при реєстрації на подію: " + err.message);
      }
    });

    li.appendChild(joinBtn);
    await appendVolunteers(event.id, li);
    list.appendChild(li);
  });
}

async function appendVolunteers(eventId, li) {
  const volunteerList = document.createElement("ul");
  volunteerList.classList.add("volunteer-scroll");
  volunteerList.textContent = "Зареєстровані волонтери:";

  try {
    const res = await fetch(
      `http://localhost:3000/events/${eventId}/volunteers`
    );
    const volunteers = await res.json();

    if (volunteers.length === 0) {
      const item = document.createElement("li");
      item.textContent = "— Ще ніхто не приєднався";
      volunteerList.appendChild(item);
    } else {
      volunteers.forEach((vol) => {
        const item = document.createElement("li");
        item.textContent = `👤 ${vol.username}`;
        volunteerList.appendChild(item);
      });
    }
  } catch (err) {
    console.error("Помилка при завантаженні волонтерів", err);
  }

  li.appendChild(volunteerList);
}
