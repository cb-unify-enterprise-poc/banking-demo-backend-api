import { Router } from "express";
import { dataClient } from "../dataClient.js";
import { requireAuth } from "../auth.js";

export const transferRouter = Router();
transferRouter.use(requireAuth);

transferRouter.post("/", async (req, res) => {
  const { fromId, toId, amount } = req.body || {};
  if (!fromId || !toId || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "fromId, toId and a positive amount are required" });
  }
  if (fromId === toId) {
    return res.status(400).json({ error: "fromId and toId must differ" });
  }

  const [fromAccount, toAccount] = await Promise.all([
    dataClient.getAccount(fromId),
    dataClient.getAccount(toId),
  ]);

  if (!fromAccount || fromAccount.owner !== req.username) {
    return res.status(404).json({ error: "source account not found" });
  }
  if (!toAccount) {
    return res.status(404).json({ error: "destination account not found" });
  }
  if (fromAccount.currency !== toAccount.currency) {
    return res.status(400).json({ error: "currency mismatch between accounts" });
  }
  if (fromAccount.balance < amount) {
    return res.status(400).json({ error: "insufficient funds" });
  }

  const updatedFrom = await dataClient.updateBalance(fromId, fromAccount.balance - amount);
  const updatedTo = await dataClient.updateBalance(toId, toAccount.balance + amount);

  await Promise.all([
    dataClient.addTransaction({
      accountId: fromId,
      description: `Transfer to ${toId}`,
      amount: -amount,
    }),
    dataClient.addTransaction({
      accountId: toId,
      description: `Transfer from ${fromId}`,
      amount,
    }),
  ]);

  res.json({ from: updatedFrom, to: updatedTo });
});
