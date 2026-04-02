document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const errorBox = document.getElementById("error");

      try {
        const data = await apiRequest("/accounts/login/", "POST", {
          username,
          password
        }, false);

        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        const me = await apiRequest("/accounts/me/");
        localStorage.setItem("user", JSON.stringify(me));

        window.location.href = "dashboard.html";
      } catch (err) {
        errorBox.textContent = "Invalid username or password.";
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
});