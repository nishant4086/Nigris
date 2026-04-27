import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const auth = req.headers.authorization;

  if (auth && auth.startsWith("Bearer")) {
    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      req.user = null;
    }
  }

  next();
};