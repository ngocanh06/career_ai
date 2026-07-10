// ─────────────────────────────────────────────────────────────
// src/services/api.js
// Lớp dịch vụ trung tâm: tất cả các component gọi API qua đây.
// Thay đổi BASE_URL nếu backend chạy ở cổng khác.
// ─────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const getBackendOrigin = () => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch (_) {
    return 'http://localhost:5000';
  }
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('career_user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && typeof user === 'object' ? user : null;
  } catch (_) {
    return null;
  }
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  const userId = user?.user_id;
  return typeof userId === 'number' ? userId : null;
};

function normalizeApiErrorMessage(err) {
  if (!err) return 'Có lỗi xảy ra';
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;
  return 'Có lỗi xảy ra';
}

async function requestJson(path, init) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, init);

  let json = null;
  try {
    json = await res.json();
  } catch (_) {
    // ignore
  }

  if (!res.ok) {
    const message = json?.message || `HTTP error ${res.status}`;
    throw new Error(message);
  }
  if (!json?.success) throw new Error(json?.message || 'API error');
  return json;
}

async function fetchData(path) {
  const json = await requestJson(path);
  return json.data;
}

// ── User ────────────────────────────────────────────────────
export const getUser = (userId) =>
  fetchData(`/user/${userId}`);

export const updateUser = async (userId, data) => {
  try {
    return await requestJson(`/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    throw new Error(normalizeApiErrorMessage(err));
  }
};

export const changePassword = async (userId, data) => {
  try {
    return await requestJson(`/user/${userId}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    throw new Error(normalizeApiErrorMessage(err));
  }
};

export const uploadAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  try {
    return await requestJson(`/user/${userId}/avatar`, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    throw new Error(normalizeApiErrorMessage(err));
  }
};

export const getLoginSessions = async (userId) => {
  try {
    return await requestJson(`/user/${userId}/sessions`);
  } catch (err) {
    throw new Error(normalizeApiErrorMessage(err));
  }
};


export const revokeOtherSessions = async (userId) => {
  try {
    return await requestJson(`/user/${userId}/sessions`, { method: 'DELETE' });
  } catch (err) {
    throw new Error(normalizeApiErrorMessage(err));
  }
};

// ── Career Orientation ───────────────────────────────────────
export const getCareers = (userId) =>
  fetchData(`/career/${userId}`);

// ── Learning Path ────────────────────────────────────────────
export const getRoadmap = (userId) =>
  fetchData(`/roadmap/${userId}`);

// ── CV Analysis ──────────────────────────────────────────────
export const getCV = (userId) =>
  fetchData(`/cv/${userId}`);

// ── Skills ───────────────────────────────────────────────────
export const getSkills = (userId) =>
  fetchData(`/skills/${userId}`);

// ── Portfolio ────────────────────────────────────────────────
export const getPortfolio = (userId) =>
  fetchData(`/portfolio/${userId}`);

export const getExperience = (userId) =>
  fetchData(`/experience/${userId}`);

export const getCertificates = (userId) =>
  fetchData(`/certificate/${userId}`);

export const getEducation = (userId) =>
  fetchData(`/education/${userId}`);

