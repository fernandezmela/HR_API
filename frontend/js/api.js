const API_BASE = "http://127.0.0.1:8000/api";

function getAccessToken() {
  return localStorage.getItem("access");
}

async function apiRequest(endpoint, method = "GET", data = null, auth = true) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw errorData;
  }

  return response.json();
}