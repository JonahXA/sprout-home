// src/lib/sproutStorage.js
export const safeParse = (raw, fallback) => {
 try {
 return raw ? JSON.parse(raw) : fallback;
 } catch {
 return fallback;
 }
};

export const getJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
export const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getLocalUser = () => getJSON("sprout_user", null);
export const setLocalUser = (u) => setJSON("sprout_user", u);

export const makeId = (prefix) =>
 crypto?.randomUUID?.() ? `${prefix}_${crypto.randomUUID()}` : `${prefix}_${Date.now()}`;
