import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", async (req: any, res: any) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const token = jwt.sign({ Email }, "jwt secret", {
    expiresIn: "1h",
  });

  res.status(200).json({ token });
});

export default router;
