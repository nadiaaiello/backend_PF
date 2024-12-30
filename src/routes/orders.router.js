import CustomRouter from "./custom.router.js";
import OrderService from "../services/order.service.js";
import { authTokenAndRole } from "../utils.js";

const orderService = new OrderService();

export default class OrdersRouter extends CustomRouter {
  init() {
    // Obtener todas las órdenes del usuario logueado
    this.get("/", [authTokenAndRole()], async (req, res) => {
      const userId = req.user.user._id;
      const orders = await orderService.getUserOrders(userId);
      res.send({ status: "success", orders });
    });

    // Crear una nueva orden
    this.post("/", [authTokenAndRole("admin")], async (req, res) => {
      const { userId, email, products, totalAmount } = req.body;

      if (!userId || !email || !products || !totalAmount) {
        return res.status(400).send({
          status: "error",
          message: "User ID, email, products, and total amount are required.",
        });
      }

      try {
        const newOrder = await orderService.createOrder(
          userId,
          email,
          products,
          totalAmount
        );
        res.status(201).send({ status: "success", order: newOrder });
      } catch (error) {
        console.error("Error creating order:", error);
        res
          .status(500)
          .send({ status: "error", message: "Failed to create order." });
      }
    });

    // Eliminar una orden por ID
    this.delete("/:orderId", [authTokenAndRole("admin")], async (req, res) => {
      const { orderId } = req.params;
      await orderService.deleteOrder(orderId);
      res.send({ status: "success", message: "Order deleted." });
    });
  }
}
