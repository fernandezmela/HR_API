document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const ticketId = params.get("id");

  const ticketBox = document.getElementById("ticketBox");
  const commentsBox = document.getElementById("commentsBox");
  const commentForm = document.getElementById("commentForm");
  const updateForm = document.getElementById("updateForm");

  async function loadTicket() {
    try {
      const ticket = await apiRequest(`/tickets/${ticketId}/`);
      ticketBox.innerHTML = `
        <h2>${ticket.title}</h2>
        <p>${ticket.description}</p>
        <p>Status: ${ticket.status}</p>
        <p>Priority: ${ticket.priority}</p>
        <p>Customer: ${ticket.customer_username}</p>
        <p>Assigned to: ${ticket.assigned_to_username || "Unassigned"}</p>
      `;

      if (user.role === "manager") {
        updateForm.style.display = "block";
        document.getElementById("status").value = ticket.status;
        document.getElementById("priority").value = ticket.priority;
        document.getElementById("assignedUser").value = ticket.assigned_to || "";
      } else if (user.role === "staff") {
        updateForm.style.display = "block";
        document.getElementById("assignRow").style.display = "none";
        document.getElementById("status").value = ticket.status;
        document.getElementById("priority").value = ticket.priority;
      }

      loadComments();
    } catch (err) {
      ticketBox.innerHTML = "<p>Could not load ticket.</p>";
    }
  }

  async function loadComments() {
    commentsBox.innerHTML = "";
    try {
      const comments = await apiRequest(`/tickets/${ticketId}/comments/`);
      comments.forEach((comment) => {
        const div = document.createElement("div");
        div.className = "ticket";
        div.innerHTML = `
          <p><strong>${comment.author_username}</strong></p>
          <p>${comment.body}</p>
          <p class="small">${comment.created_at}</p>
        `;
        commentsBox.appendChild(div);
      });
    } catch (err) {
      commentsBox.innerHTML = "<p>Could not load comments.</p>";
    }
  }

  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = document.getElementById("commentBody").value;
    try {
      await apiRequest(`/tickets/${ticketId}/comments/`, "POST", { body });
      commentForm.reset();
      loadComments();
    } catch (err) {
      alert("Could not post comment.");
    }
  });

  updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const currentTicket = await apiRequest(`/tickets/${ticketId}/`);
      const payload = {
        title: currentTicket.title,
        description: currentTicket.description,
        status: document.getElementById("status").value,
        priority: document.getElementById("priority").value
      };

      if (user.role === "manager") {
        const assignedUser = document.getElementById("assignedUser").value;
        payload.assigned_to = assignedUser ? parseInt(assignedUser) : null;
      }

      await apiRequest(`/tickets/${ticketId}/`, "PUT", payload);
      loadTicket();
    } catch (err) {
      alert("Could not update ticket.");
    }
  });

  if (user.role === "manager") {
    try {
      const staff = await apiRequest("/accounts/staff/");
      const select = document.getElementById("assignedUser");
      staff.forEach((s) => {
        const option = document.createElement("option");
        option.value = s.id;
        option.textContent = s.username;
        select.appendChild(option);
      });
    } catch (err) {
      console.error(err);
    }
  } else {
    document.getElementById("assignRow").style.display = "none";
  }

  loadTicket();
});