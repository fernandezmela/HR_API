document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("welcome").textContent = `Welcome, ${user.username} (${user.role})`;

  const ticketContainer = document.getElementById("tickets");
  const createSection = document.getElementById("createTicketSection");
  const managerSection = document.getElementById("managerSection");
  const staffListSelect = document.getElementById("assigned_to");

  if (user.role === "customer") {
    createSection.style.display = "block";
  }

  if (user.role === "manager") {
    managerSection.style.display = "block";
    try {
      const staffMembers = await apiRequest("/accounts/staff/");
      staffMembers.forEach((staff) => {
        const option = document.createElement("option");
        option.value = staff.id;
        option.textContent = staff.username;
        staffListSelect.appendChild(option);
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTickets() {
    ticketContainer.innerHTML = "";
    try {
      const tickets = await apiRequest("/tickets/");
      tickets.forEach((ticket) => {
        const div = document.createElement("div");
        div.className = "ticket";
        div.innerHTML = `
          <h3>${ticket.title}</h3>
          <p>${ticket.description}</p>
          <p class="small">Status: ${ticket.status} | Priority: ${ticket.priority}</p>
          <p class="small">Customer: ${ticket.customer_username || "N/A"}</p>
          <p class="small">Assigned to: ${ticket.assigned_to_username || "Unassigned"}</p>
          <a href="ticket.html?id=${ticket.id}">Open ticket</a>
        `;
        ticketContainer.appendChild(div);
      });
    } catch (err) {
      console.error("Load tickets error:", err);
      ticketContainer.innerHTML = "<p>Could not load tickets.</p>";
    }
  }

  const createTicketForm = document.getElementById("createTicketForm");
  if (createTicketForm) {
    createTicketForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value.trim();
      const description = document.getElementById("description").value.trim();

      try {
        const result = await apiRequest("/tickets/", "POST", { title, description });
        console.log("Ticket created:", result);
        alert("Ticket created successfully.");
        createTicketForm.reset();
        await loadTickets();
      } catch (err) {
        console.error("Create ticket error:", err);
        if (err.detail) {
          alert(err.detail);
        } else if (err.title) {
          alert("Title: " + err.title.join(" "));
        } else if (err.description) {
          alert("Description: " + err.description.join(" "));
        } else {
          alert("Ticket could not be created.");
        }
      }
    });
  }

  await loadTickets();
});