import cartsModel from "./models/carts.model.js";
import ordersModel from "./models/order.model.js";
import transporter  from "../controllers/email.controller.js";

export default class CartService {
  getAll = async () => {
    let carts = await cartsModel
      .find()
      .populate("user")
      .populate("products.product");

    return carts;
  };

  save = async (cart) => {
    if (!cart.products.every((p) => p.product && p.quantity > 0)) {
      throw new Error("Invalid product structure in cart");
    }
    let result = await cartsModel.create(cart);
    return result;
  };

  getById = async (id) => {
    const result = await cartsModel
      .findOne({ _id: id })
      .populate("user")
      .populate("products.product");
    return result;
  };

  getCartByUserId = async (userId) => {
    try {
      const cart = await cartsModel
        .findOne({ user: userId })
        .populate("user")
        .populate("products.product");
      if (!cart) {
        console.log(`Cart not found for user ID: ${userId}`);
      } else {
        //console.log("cart1", cart);
        return cart.toObject();
      }
    } catch (error) {
      console.error(`Error fetching cart for user ID ${userId}:`, error);
      throw error;
    }
  };

  update = async (id, data) => {
    const result = await cartsModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate("user")
      .populate("products.product");
    return result;
  };

  delete = async (id) => {
    const result = await cartsModel.findByIdAndDelete(id);
    return result;
  };

  removeProduct = async (cartId, productId) => {
    const cart = await cartsModel.findById(cartId);
    if (!cart) throw new Error("Cart not found");

    // Filter the products array by matching the 'product' field with the provided productId
    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId // Use item.product to access the product ObjectId
    );

    await cart.save();
    return cart;
  };

  checkout = async (cartId, userId) => {
    const cart = await cartsModel
      .findOne({ user: userId })
      .populate("user")
      .populate("products.product");

    if (!cart || cart.products.length === 0) {
      throw new Error("Cart is empty or not found.");
    }

    const totalAmount = cart.products.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const newOrder = {
      user: {
        _id: cart.user._id,
        email: cart.user.email,
      },
      products: cart.products.map((item) => ({
        product: {
          productId: item._id,
          title: item.title || "producto",
        },
        quantity: item.quantity,
      })),
      totalAmount,
    };

    // Save the order
    const order = await ordersModel.create(newOrder);

    // Clear the cart
    cart.products = [];
    await cart.save();

    // Send email to the user
    const emailContent = `
      <div>
        <h1>Thank you for your purchase!</h1>
        <p>Your order has been successfully processed.</p>
        <h2>Order Details</h2>
        <ul>
          ${order.products
            .map(
              (item) => `
            <li>
              <strong>Product:</strong> ${item.title} <br>
              <strong>Quantity:</strong> ${item.quantity}
            </li>`
            )
            .join("")}
        </ul>
        <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
        <p>Order ID: ${order._id}</p>
      </div>
    `;

    await transporter.sendMail({
      from: "jutecno <no-reply@jutecno.com>",
      to: order.user.email,
      subject: "Your Jutecno Order Confirmation",
      html: emailContent,
    });

    return order;
  };
}
