const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("neuronest_token");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export const api = {
  register: (body) => request("/auth/register", {method:"POST", body:JSON.stringify(body)}),
  login: (body) => request("/auth/login", {method:"POST", body:JSON.stringify(body)}),
  me: () => request("/auth/me"),
  intention: {
    get: () => request("/api/intentions/today"),
    create: (text) => request("/api/intentions", {method:"POST",body:JSON.stringify({text})}),
    update: (id, achieved) => request(`/api/intentions/${id}`, {method:"PATCH",body:JSON.stringify({achieved})}),
  },
  focus: {
    create: (task, planned_minutes=25) => request("/api/focus", {method:"POST",body:JSON.stringify({task,planned_minutes})}),
    complete: (id, actual_minutes, completed=true) => request(`/api/focus/${id}`, {method:"PATCH",body:JSON.stringify({actual_minutes,completed})}),
  },
  cognitive: (body) => request("/api/cognitive", {method:"POST",body:JSON.stringify(body)}),
  music: (body) => request("/api/music", {method:"POST",body:JSON.stringify(body)}),
  mood: (mood) => request("/api/mood", {method:"POST",body:JSON.stringify({mood})}),
  journal: {
    list: () => request("/api/journal"),
    add: (content) => request("/api/journal",{method:"POST",body:JSON.stringify({content})}),
  },
  wellness: (body) => request("/api/wellness",{method:"POST",body:JSON.stringify(body)}),
  chat: (message) => request("/api/chat",{method:"POST",body:JSON.stringify({message})}),
  analytics: () => request("/api/analytics"),
};
