// Demo-only auth: token is just base64(username). There is no signing,
// expiry, or real session management. Do not reuse this pattern outside
// of a throwaway demo.

export function issueToken(username) {
  return Buffer.from(username, "utf-8").toString("base64");
}

export function verifyToken(token) {
  try {
    return Buffer.from(token, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "missing bearer token" });
  }
  const username = verifyToken(token);
  if (!username) return res.status(401).json({ error: "invalid token" });
  req.username = username;
  next();
}
