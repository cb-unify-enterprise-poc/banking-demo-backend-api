import { Router } from "express";
import { dataClient } from "../dataClient.js";
import { requireAuth } from "../auth.js";

export const accountsRouter = Router();
accountsRouter.use(requireAuth);

accountsRouter.get("/", async (req, res) => {
  const accounts = await dataClient.getAccountsByOwner(req.username);
  res.json(accounts);
});

accountsRouter.get("/:id", async (req, res) => {
  const account = await dataClient.getAccount(req.params.id);
  if (!account || account.owner !== req.username) {
    return res.status(404).json({ error: "account not found" });
  }
  res.json(account);
});

accountsRouter.get("/:id/transactions", async (req, res) => {
  const account = await dataClient.getAccount(req.params.id);
  if (!account || account.owner !== req.username) {
    return res.status(404).json({ error: "account not found" });
  }
  const transactions = await dataClient.getTransactions(req.params.id);
  res.json(transactions);
});
