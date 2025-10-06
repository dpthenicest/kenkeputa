
const SERVER_API_URL = `http://localhost:5000/api`;

export const authService = {
  register: async (data: { fullName: string; email: string; password: string }) => {
    const res = await fetch(`${SERVER_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error((await res.json()).message || "Registration failed");
    return res.json();
  },

  login: async (data: { email: string; password: string }) => {
    const res = await fetch(`${SERVER_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error((await res.json()).message || "Login failed");
    return res.json();
  },
};
