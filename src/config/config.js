import dotenv from "dotenv";
import { Command } from "commander";

const program = new Command(); // Crea la instancia de comandos de commander.

program
  .option("-d", "Variable para debug", false) // Opción para debug
  .option("--persist <mode>", "Modo de persistencia", "mongodb") // Opción para modo de persistencia
  .option("--mode <mode>", "Modo de trabajo", "dev") // Opción para modo de trabajo
  .parse(); // Parsea las opciones

// Obtiene las opciones seleccionadas
const environment = program.opts().mode;

// Configura dotenv para cargar el archivo .env correspondiente
dotenv.config({
  path:
    environment === "prod"
      ? "./src/config/.env.production"
      : "./src/config/.env.development",
});

// Exporta la configuración
export default {
  mode: environment, // Modo de trabajo
  persistence: program.opts().persist, // Modo de persistencia
  adminName: process.env.ADMIN_NAME, // Nombre del administrador
  adminPassword: process.env.ADMIN_PASSWORD,
  gmailAccount: process.env.GMAIL_ACCOUNT,
  gmailAppPassword: process.env.GMAIL_APP_PASSWD, // Contraseña del administrador
  cookieSecret: process.env.COOKIE_SECRET || "defaultCookieSecret", // Clave secreta para las cookies
  cookieOptions: {
    httpOnly: true, // Evita que las cookies sean accesibles desde JavaScript
    secure: environment === "prod", // Cookies seguras solo en producción
    signed: true, // Cookies firmadas
    maxAge: 1000 * 60 * 60 * 24, // Duración de 1 día
  },
  debug: program.opts().d, // Variable para debug
};
