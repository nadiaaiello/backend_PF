import CustomRouter from "./custom.router.js";
import passport from "passport";

import { createHash, generateJWToken, authTokenAndRole } from "../utils.js";
import {
  github,
  login,
  logout,
  register,
  getUserbyId,
} from "../controllers/user.controller.js";

class UserRouter extends CustomRouter {
  init() {
    // Registro de usuario
    this.post("/register", [], register);

    // Login de usuario
    this.post("/login", [], login);

    this.get(
      "/auth/github",
      [],
      passport.authenticate("github", { scope: ["user:email"] })
    );

    // GitHub callback route
    this.get(
      "/auth/github/callback",
      [
        passport.authenticate("github", {
          failureRedirect: "/login",
        }),
      ],
      github
    );

    // Logout endpoint
    this.post("/logout", [], logout);

    // Obtener usuario por ID
    this.get("/user", [authTokenAndRole()], getUserbyId);
  }
}

export default UserRouter;
