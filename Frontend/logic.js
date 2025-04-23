document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

function parseJwt(token) {
  const base64Payload = token.split('.')[1];
  const payload = atob(base64Payload);
  return JSON.parse(payload);
}


// реєстрація
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password')
  };

  try {
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    document.getElementById('registerMessage').textContent = result.message;

    if (res.ok) {
      await loginUser(data.email, data.password);
    }

  } catch (err) {
    document.getElementById('registerMessage').textContent = 'Помилка реєстрації';
  }
});

// вхід
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');

  await loginUser(email, password);
});

// авторизація
async function loginUser(email, password) {
  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (res.ok) {
      localStorage.setItem('token', result.token); 
      showMainPage();
    } else {
      document.getElementById('loginMessage').textContent = result.message || 'Помилка входу';
    }
  } catch (err) {
    document.getElementById('loginMessage').textContent = 'Помилка підключення до сервера';
  }
}

// загрузка подій
async function loadEvents() {
  try {
    const res = await fetch('http://localhost:3000/events');
    const events = await res.json();

    const list = document.getElementById('eventsList');
    list.innerHTML = '';
    const eventForm = document.getElementById('eventForm');

    events.forEach(event => {
      const li = document.createElement('li');
      const date = new Date(event.date);
      const formattedDate = date.toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      li.innerHTML = `
        <strong>${event.title}</strong><br />
        📅 <em>${formattedDate}</em><br />
        🧭 <strong>Місце:</strong> ${event.location}<br />
        📝 <strong>Опис:</strong> ${event.description}
        <hr />
      `;

      const editBtn = document.createElement('button');
      editBtn.textContent = '✏️ Редагувати';
      editBtn.addEventListener('click', () => {
        eventForm.style.display = 'block';
        eventForm.elements.eventId.value = event.id;
        eventForm.elements.title.value = event.title;
        eventForm.elements.date.value = new Date(event.date).toISOString().slice(0, 16);
        eventForm.elements.location.value = event.location;
        eventForm.elements.description.value = event.description;
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑️ Видалити';
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Ви впевнені, що хочете видалити цю подію?')) {
          try {
            await fetch(`http://localhost:3000/events/${event.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            loadEvents();
          } catch (err) {
            alert('Помилка при видаленні події');
          }
        }
      });

      const joinBtn = document.createElement('button');
      joinBtn.textContent = '🙋‍♂️ Приєднатися';
      joinBtn.addEventListener('click', async () => {
        try {
          const res = await fetch(`http://localhost:3000/events/${event.id}/register`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          const result = await res.json();
          alert(result.message || 'Ви приєдналися до події!');
          loadEvents(); // оновимо список після приєднання
        } catch (err) {
          alert('Помилка при реєстрації на подію: ' + err.message);
        }
      });

      // 👇 Блок зареєстрованих волонтерів
      const volunteerList = document.createElement('ul');
      volunteerList.textContent = '🔽 Зареєстровані волонтери:';

      fetch(`http://localhost:3000/events/${event.id}/volunteers`)
        .then(res => res.json())
        .then(volunteers => {
          if (volunteers.length === 0) {
            const noOne = document.createElement('li');
            noOne.textContent = '— Ще ніхто не приєднався';
            volunteerList.appendChild(noOne);
          } else {
            volunteers.forEach(vol => {
              const nameItem = document.createElement('li');
              nameItem.textContent = `👤 ${vol.username}`;
              volunteerList.appendChild(nameItem);
            });
          }
        })
        .catch(err => {
          console.error('Помилка при завантаженні волонтерів', err);
        });

      // Додати все до li
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      li.appendChild(joinBtn);
      li.appendChild(volunteerList); // 👈 тут вставляється список волонтерів

      list.appendChild(li);
    });

  } catch (err) {
    console.error('Помилка при завантаженні подій:', err);
  }
}



function showMainPage() {
  document.getElementById('register').style.display = 'none';
  document.getElementById('login').style.display = 'none';
  document.querySelector('[data-tab="register"]').style.display = 'none';
  document.querySelector('[data-tab="login"]').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  const showEventFormBtn = document.getElementById('showEventFormBtn');
  const eventForm = document.getElementById('eventForm');
  const cancelEditBtn = document.getElementById('cancelEditBtn');


  showEventFormBtn.addEventListener('click', () => {
    eventForm.reset();
    eventForm.elements.eventId.value = '';
    eventForm.style.display = 'block';
  });


  cancelEditBtn.addEventListener('click', () => {
    eventForm.style.display = 'none';
    eventForm.reset();
  });

eventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(eventForm);
  const eventId = formData.get('eventId');
  console.log(eventId)
  const method = eventId ? 'PUT' : 'POST';
  const url = eventId ? `http://localhost:3000/events/${eventId}` : 'http://localhost:3000/events';
  const data = {
    title: formData.get('title'),
    date: formData.get('date'),
    location: formData.get('location'),
    description: formData.get('description')
  };
  try {
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    eventForm.style.display = 'none';
    eventForm.reset();
    loadEvents();

  } catch (err) {
    alert('Помилка при збереженні події');
  }
});
  loadEvents();
}
