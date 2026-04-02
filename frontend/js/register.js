document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const messageBox = document.getElementById("message");

  if (!registerForm) return;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      username: document.getElementById("username").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      role: document.getElementById("role").value
    };

    messageBox.style.color = "black";
    messageBox.textContent = "Submitting...";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));
      console.log("Register response:", data);

      if (!res.ok) {
        messageBox.style.color = "red";

        if (data.username) {
          messageBox.textContent = `Username: ${data.username.join(" ")}`;
        } else if (data.email) {
          messageBox.textContent = `Email: ${data.email.join(" ")}`;
        } else if (data.password) {
          messageBox.textContent = `Password: ${data.password.join(" ")}`;
        } else if (data.role) {
          messageBox.textContent = `Role: ${data.role.join(" ")}`;
        } else if (data.detail) {
          messageBox.textContent = data.detail;
        } else if (data.message) {
          messageBox.textContent = data.message;
        } else {
          messageBox.textContent = "Registration failed.";
        }
        return;
      }

      messageBox.style.color = "green";
      messageBox.textContent = "Registration successful. You can now log in.";
      registerForm.reset();
    } catch (error) {
      console.error("Register request failed:", error);
      messageBox.style.color = "red";
      messageBox.textContent = "Could not reach backend. Make sure Django is running on port 8000.";
    }
  });
});