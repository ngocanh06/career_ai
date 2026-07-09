// ─────────────────────────────────────────────────────────────
// src/services/api.js
// Lớp dịch vụ trung tâm: tất cả các component gọi API qua đây.
// Thay đổi BASE_URL nếu backend chạy ở cổng khác.
// ─────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:5000/api';

// ID người dùng hiện tại đang đăng nhập (tạm thời hardcode)
// Sau này sẽ lấy từ Auth context / localStorage
export const CURRENT_USER_ID = 19;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'API error');
  return json.data;
}

// ── User ────────────────────────────────────────────────────
export const getUser = (userId) =>
  fetchJson(`${BASE_URL}/user/${userId}`);

export const updateUser = async (userId, data) => {
  const res = await fetch(`${BASE_URL}/user/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json;
};

export const changePassword = async (userId, data) => {
  const res = await fetch(`${BASE_URL}/user/${userId}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json;
};

export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch(`${BASE_URL}/user/${userId}/avatar`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json;
};

export const getLoginSessions = async (userId) => {
  const res = await fetch(`${BASE_URL}/user/${userId}/sessions`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json;
};

export const getLoginHistory = async (userId) => {
  const res = await fetch(`${BASE_URL}/user/${userId}/login_history`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json;
};

export const revokeOtherSessions = async (userId) => {
  const res = await fetch(`${BASE_URL}/user/${userId}/sessions`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json;
};

// ── Career Orientation ───────────────────────────────────────
export const getCareers = (userId) =>
  fetchJson(`${BASE_URL}/career/${userId}`);

// ── Learning Path ────────────────────────────────────────────
export const getRoadmap = (userId) =>
  fetchJson(`${BASE_URL}/roadmap/${userId}`);

// ── CV Analysis ──────────────────────────────────────────────
export const getCV = (userId) =>
  fetchJson(`${BASE_URL}/cv/${userId}`);

// ── Skills ───────────────────────────────────────────────────
export const getSkills = (userId) =>
  fetchJson(`${BASE_URL}/skills/${userId}`);

// ── Portfolio ────────────────────────────────────────────────
export const getPortfolio = (userId) =>
  fetchJson(`${BASE_URL}/portfolio/${userId}`);

export const getExperience = (userId) =>
  fetchJson(`${BASE_URL}/experience/${userId}`);

export const getCertificates = (userId) =>
  fetchJson(`${BASE_URL}/certificate/${userId}`);

export const getEducation = (userId) =>
  fetchJson(`${BASE_URL}/education/${userId}`);

