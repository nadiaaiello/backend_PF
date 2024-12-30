import CustomRouter from "./custom.router.js";
import CartService from "../services/cart.service.js";
import { authTokenAndRole } from "../utils.js";
import {
  getAllCarts,
  getCartById,
  getCartByUserId,
  addProductToCart,
  removeProductFromCart,
  updateProduct,
  //clearCart,
  deleteCart,checkout
} from "../controllers/cart.controller.js";

const cartService = new CartService();
class CartRouter extends CustomRouter {
  init() {
    this.get("/", [], getAllCarts);
    this.get("/user", [authTokenAndRole()], getCartByUserId);
    this.get("/:cid", [], getCartById);
    this.post("/:cid/products/:pid", [], addProductToCart);
    this.delete("/:cid/products/:pid", [], removeProductFromCart);
    this.put("/:cid/products/:pid", [], updateProduct);
    //this.get("/clear", [authTokenAndRole()], clearCart);
    this.delete("/:cid", [authTokenAndRole("ADMIN")], deleteCart);
    this.post("/checkout",[authTokenAndRole()],checkout)
  }
}
export default CartRouter;
