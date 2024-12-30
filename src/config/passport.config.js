import passport from "passport";
import userModel from "../services/models/users.model.js";
import jwtStrategy from "passport-jwt";
import GitHubStrategy from "passport-github2";
import passportLocal from "passport-local";
import { PRIVATE_KEY, createHash } from "../utils.js";

const localStrategy = passportLocal.Strategy;
const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

const initializePassport = () => {
  // Estrategia de obtener Token JWT por Cookie
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        //console.log("Entrando a passport Strategy con JWT.");
        try {
          console.log("JWT obtenido del Payload:", jwt_payload);
          return done(null, jwt_payload.user);
        } catch (error) {
          console.error("Error en JWT Strategy:", error);
          return done(error);
        }
      }
    )
  );

  /*=============================================
  =                GitHubStrategy               =
  =============================================*/
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL, // Corregido
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("Profile obtenido del usuario:", profile);
        try {
          const email = profile.emails?.[0]?.value || "email-no-disponible@github.com";
          const user = await userModel.findOne({ email });
  
          if (!user) {
            console.warn("User doesn't exist with email:", email);
            const newUser = {
              first_name: profile.displayName || profile.username || "Sin Nombre",
              last_name: "",
              age: 18,
              email,
              password: "",
              loggedBy: "GitHub",
            };
            const result = await userModel.create(newUser);
            return done(null, result);
          } else {
            return done(null, user);
          }
        } catch (error) {
          console.error("Error en GitHub Strategy:", error);
          return done(error);
        }
      }
    )
  );
  

  // Estrategia de Registro Local
  passport.use(
    "register",
    new localStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          const exist = await userModel.findOne({ email });
          if (exist) {
            console.log("El usuario ya existe con email:", email);
            return done(null, false, { message: "User already exists." });
          }

          const user = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            loggedBy: "form",
          };
          const result = await userModel.create(user);
          console.log("Usuario creado exitosamente:", result);
          return done(null, result);
        } catch (error) {
          console.error("Error en estrategia de registro:", error);
          return done(error);
        }
      }
    )
  );

  // Serialización y Desserialización
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (error) {
      console.error("Error deserializando el usuario:", error);
      done(error);
    }
  });
};

// Cookie Extractor
const cookieExtractor = (req) => {
  //console.log("Entrando a Cookie Extractor");
  if (req && req.cookies) {
    console.log("Cookies presentes:", req.cookies);
    const token = req.cookies["jwtCookieToken"];
    if (!token) {
      console.warn("Token JWT no encontrado en cookies.");
    } else {
      console.log("Token obtenido desde Cookie:", token);
    }
    return token;
  }
  console.warn("No hay cookies en la solicitud.");
  return null;
};

export default initializePassport;
