import { Router } from "express";
import { dataClient } from "../dataClient.js";
import { issueToken } from "../auth.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }
  const user = await dataClient.getUser(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "invalid credentials" });
  }
  res.json({
    token: issueToken(username),
    user: { username: user.username, name: user.name },
  });
});
