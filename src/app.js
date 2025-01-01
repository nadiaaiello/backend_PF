import express from "express";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import config from "./config/config.js";
import MongoSingleton from "./config/mongodb-singleton.js";
import cors from "cors";

// Import de routes
import UserRouter from "./routes/user.router.js";
import CartRouter from "./routes/cart.router.js";
import ProductRouter from "./routes/products.router.js";
import ViewsRouter from "./routes/views.router.js";
import OrdersRouter from "./routes/orders.router.js";
import emailRouter from './routes/email.router.js';

const app = express();
const PORT=process.env.PORT || 9090;

// JSON settings
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Habilitación de CORS
app.use(cors());

// Configuración de Cookies
app.use(cookieParser(config.cookieSecret));

// Passport Middlewares
initializePassport();
app.use(passport.initialize());

// Middleware de Respuestas Globales
app.use((req, res, next) => {
  res.sendSuccess = (payload) =>
    res.status(200).send({ status: "Success", payload });
  res.sendError = (error, status = 500) =>
    res.status(status).send({ status: "Error", error });
  next();
});

// Configuración de Handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));

// Rutas
const userRouter = new UserRouter();
app.use("/api/users", userRouter.getRouter());
const cartRouter = new CartRouter();
app.use("/api/carts", cartRouter.getRouter());
const productrouter = new ProductRouter();
app.use("/api/products", productrouter.getRouter());
const viewsRouter = new ViewsRouter();
app.use("/", viewsRouter.getRouter());
const ordersRouter = new OrdersRouter();
app.use("/api/orders", ordersRouter.getRouter());
app.use("/api/email", emailRouter);

// Ruta de Prueba
app.get("/health", (req, res) => {
  res.sendSuccess({ message: "Servidor funcionando correctamente" });
});

// Ruta Comodín 404
app.all("*", (req, res) => {
  res.status(404).sendError("Ruta no encontrada");
});

// Middleware Global de Errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).sendError("Error interno del servidor");
});

// Conexión a MongoDB y Arranque del Servidor
const startServer = async () => {
  try {
    await MongoSingleton.getInstance();
    // app.listen(config.port, () => {
    //   console.log(`Servidor escuchando en el puerto ${config.port}`);
    // });
    app.listen(PORT,()=>console.log(`listening on ${PORT}`))
  } catch (error) {
    console.error("Error al iniciar la aplicación:", error);
  }
};

startServer();
