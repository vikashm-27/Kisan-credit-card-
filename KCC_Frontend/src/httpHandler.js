import { SERVER_url } from "./config";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/JSON",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export function httpPostService(url, data) {
  const apiURL = `${SERVER_url}/${url}`;
  return fetch(`${apiURL}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.status === 401) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json().then((data) => {
            if (data.sessionRevoked) {
              // Session was revoked - force logout
              localStorage.clear();
              window.location.href = "/";
            }
            throw new Error(data.message || "Unauthorized");
          });
        }
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => console.log(err));
}

export function httpGetService(url) {
  const apiURL = `${SERVER_url}/${url}`;
  return fetch(`${apiURL}`, {
    method: "GET",
    headers: getAuthHeaders(),
  })
    .then((response) => {
      if (response.status === 401) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json().then((data) => {
            if (data.sessionRevoked) {
              localStorage.clear();
              window.location.href = "/";
            }
            throw new Error(data.message || "Unauthorized");
          });
        }
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => console.log(err));
}

export function httpPutService(url, data) {
  const apiURL = `${SERVER_url}/${url}`;
  return fetch(`${apiURL}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.status === 401) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json().then((data) => {
            if (data.sessionRevoked) {
              localStorage.clear();
              window.location.href = "/";
            }
            throw new Error(data.message || "Unauthorized");
          });
        }
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => console.log(err));
}

export function httpDeleteService(url) {
  const apiURL = `${SERVER_url}/${url}`;
  return fetch(`${apiURL}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })
    .then((response) => {
      if (response.status === 401) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return response.json().then((data) => {
            if (data.sessionRevoked) {
              localStorage.clear();
              window.location.href = "/";
            }
            throw new Error(data.message || "Unauthorized");
          });
        }
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => console.log(err));
}
