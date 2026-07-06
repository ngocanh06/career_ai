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

