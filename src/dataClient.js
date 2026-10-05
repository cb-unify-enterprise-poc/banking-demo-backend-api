const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${DATA_SERVICE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`data-service ${path} failed: ${res.status}`);
  return res.json();
}

export const dataClient = {
  getUser: (username) => request(`/users/${encodeURIComponent(username)}`),
  getAccountsByOwner: (owner) => request(`/accounts?owner=${encodeURIComponent(owner)}`),
  getAccount: (id) => request(`/accounts/${encodeURIComponent(id)}`),
  updateBalance: (id, balance) =>
    request(`/accounts/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ balance }) }),
  getTransactions: (accountId) => request(`/transactions?accountId=${encodeURIComponent(accountId)}`),
  addTransaction: (tx) => request(`/transactions`, { method: "POST", body: JSON.stringify(tx) }),
};
