import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { accountsRouter } from "./routes/accounts.js";
import { transferRouter } from "./routes/transfer.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/auth", authRouter);
app.use("/accounts", accountsRouter);
app.use("/transfer", transferRouter);

app.listen(PORT, () => {
  console.log(`backend-api listening on ${PORT}`);
});
