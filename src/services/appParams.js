const isNode = typeof window === "undefined";

// In SSR/test environments, just behave like "no params"
const getSafeStorage = () => {
 if (isNode) return null;
 try {
 return window.localStorage;
 } catch {
 return null;
 }
};

const storage = getSafeStorage();

const toSnakeCase = (str) => str.replace(/([A-Z])/g, "_$1").toLowerCase();

const getAppParamValue = (
 paramName,
 { defaultValue = undefined, removeFromUrl = false, storagePrefix = "app" } = {}
) => {
 if (isNode) return defaultValue;

 const storageKey = `${storagePrefix}_${toSnakeCase(paramName)}`;

 const urlParams = new URLSearchParams(window.location.search);
 const searchParam = urlParams.get(paramName);

 if (removeFromUrl && searchParam) {
 urlParams.delete(paramName);
 const newUrl =
 `${window.location.pathname}` +
 `${urlParams.toString() ? `?${urlParams.toString()}` : ""}` +
 `${window.location.hash}`;
 window.history.replaceState({}, document.title, newUrl);
 }

 // 1) URL param wins
 if (searchParam) {
 storage?.setItem?.(storageKey, searchParam);
 return searchParam;
 }

 // 2) defaultValue next (must allow 0 / empty string)
 if (defaultValue !== undefined && defaultValue !== null) {
 storage?.setItem?.(storageKey, String(defaultValue));
 return defaultValue;
 }

 // 3) stored value last
 const storedValue = storage?.getItem?.(storageKey);
 if (storedValue !== null && storedValue !== undefined) {
 return storedValue;
 }

 return null;
};

const getAppParams = () => {
 return {
 // Optional, if you still want to support passing these in URL params:
 // ?supabase_url=...&supabase_anon_key=...
 supabaseUrl: getAppParamValue("supabase_url", {
 defaultValue: import.meta.env.VITE_SUPABASE_URL,
 storagePrefix: "app",
 }),
 supabaseAnonKey: getAppParamValue("supabase_anon_key", {
 defaultValue: import.meta.env.VITE_SUPABASE_ANON_KEY,
 storagePrefix: "app",
 }),

 // Keep token support if your auth flow ever passes tokens in the URL.
 // (Supabase usually doesn’t need this manually, but leaving it doesn’t hurt.)
 token: getAppParamValue("access_token", {
 removeFromUrl: true,
 storagePrefix: "app",
 }),

 fromUrl: getAppParamValue("from_url", {
 defaultValue: window.location.href,
 storagePrefix: "app",
 }),

 // If you had “functions_version” before, keep it as a generic param
 functionsVersion: getAppParamValue("functions_version", { storagePrefix: "app" }),
 };
};

export const appParams = {
 ...getAppParams(),
};
