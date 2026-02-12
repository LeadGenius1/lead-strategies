// In-memory PKCE store for OAuth (use Redis in production)
const store = new Map();

function set(key, value) {
  store.set(key, value);
  setTimeout(() => store.delete(key), 10 * 60 * 1000);
}

function get(key) {
  const v = store.get(key);
  store.delete(key);
  return v;
}

module.exports = { set, get };
