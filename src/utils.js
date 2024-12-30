import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PRIVATE_KEY = "CoderhouseBackendCourseSecretKeyJWT";

// Funciones de cifrado
export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);

// Generación de tokens JWT
export const generateJWToken = (user) => {
  return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "120000s" });
};

// Middleware de autenticación y autorización
export const authTokenAndRole = (requiredRole) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .send({ error: "User not authenticated or missing token." });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
    if (error) {
      return res.status(403).send({ error: "Token invalid, Unauthorized!" });
    }
    console.log("Decoded user from token:", credentials.user); // Log decoded user
    const user = credentials.user;
    if (requiredRole && user.role !== requiredRole.toUpperCase()) {
      return res.status(403).send({
        error: "Forbidden: User does not have the required privileges.",
      });
    }
    req.user = credentials.user;
    next();
  });
};

export default __dirname;
