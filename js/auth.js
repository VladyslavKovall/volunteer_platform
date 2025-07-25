import { parseJwt } from "./utils.js";

export function setupAuth(onLoginSuccess) {
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const res = await fetch("http://localhost:3000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();
        document.getElementById("registerMessage").textContent = result.message;

        if (res.ok) {
          await loginUser(data.email, data.password, onLoginSuccess);
        }
      } catch {
        document.getElementById("registerMessage").textContent =
          "Помилка реєстрації";
      }
    });

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    await loginUser(email, password, onLoginSuccess);
  });
}

async function loginUser(email, password, onSuccess) {
  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();

    if (res.ok) {
      localStorage.setItem("token", result.token);
      onSuccess();
    } else {
      document.getElementById("loginMessage").textContent =
        result.message || "Помилка входу";
    }
  } catch {
    document.getElementById("loginMessage").textContent =
      "Помилка підключення до сервера";
  }
}
