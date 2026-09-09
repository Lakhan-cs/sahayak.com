const API_CONFIG = window.API_CONFIG || {
  BASE_URL: "/api",
  USE_MOCK_DATA: false,
  REQUEST_TIMEOUT: 15000
};

async function apiRequest(path, options = {}) {
  if (API_CONFIG.USE_MOCK_DATA) return mockResponse(path, options);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);
  const token = localStorage.getItem("nabhi_access_token");

  try {
    const headers = {
      ...(options.body instanceof FormData ? {} : {"Content-Type": "application/json"}),
      ...(options.headers || {})
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    let response = await fetch(API_CONFIG.BASE_URL + path, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers
    });

    if (response.status === 401 && token && !path.includes("/auth/refresh")) {
      const refreshed = await fetch(API_CONFIG.BASE_URL + "/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (refreshed.ok) {
        const data = await refreshed.json().catch(() => ({}));
        if (data.accessToken) {
          localStorage.setItem("nabhi_access_token", data.accessToken);
          if (data.user) localStorage.setItem("nabhi_user", JSON.stringify(data.user));
          headers.Authorization = `Bearer ${data.accessToken}`;
          response = await fetch(API_CONFIG.BASE_URL + path, {...options, signal: controller.signal, credentials:"include", headers});
        }
      }
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || "Request failed");
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const workerAPI = {
  getProfile: () => apiRequest("/worker/profile"),
  updateProfile: data => apiRequest("/worker/profile", {method:"PUT", body:JSON.stringify(data)}),
  getDashboard: () => apiRequest("/worker/dashboard"),
  getEarnings: range => apiRequest("/worker/earnings?range=" + encodeURIComponent(range)),
  setAvailability: available => apiRequest("/worker/availability", {method:"PATCH", body:JSON.stringify({available})}),
  getJobs: () => apiRequest("/worker/jobs"),
  acceptJob: id => apiRequest(`/worker/jobs/${encodeURIComponent(id)}/accept`, {method:"POST"}),
  getWelfare: () => apiRequest("/worker/welfare"),
  signOut: async () => {
    try { await apiRequest("/auth/logout", {method:"POST"}); }
    finally { localStorage.removeItem("nabhi_access_token"); localStorage.removeItem("nabhi_user"); }
  }
};
