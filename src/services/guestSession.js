const GUEST_KEY = "sprout_guest_id";

export function getOrCreateGuestId() {
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    const hex = Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
    id = `guest_${hex}`;
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export function getGuestId() {
  return localStorage.getItem(GUEST_KEY);
}

export function clearGuestSession() {
  localStorage.removeItem(GUEST_KEY);
}
