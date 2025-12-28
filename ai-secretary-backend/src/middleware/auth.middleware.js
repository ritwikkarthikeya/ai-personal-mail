import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId, // 🔴 MUST MATCH emails.user_id
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
