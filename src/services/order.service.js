import OrdersModel from "../services/models/order.model.js";

export default class OrderService {
  async getUserOrders(userId) {
    return await OrdersModel.find({ "user._id": userId });
  }

  async createOrder(userId, email, products, totalAmount) {
    // Hardcodeamos los datos necesarios
    const productsMapped = products.map((product) => ({
      productId: product._id,
      productName: product.name,
      quantity: product.quantity,
    }));

    const newOrder = {
      user: {
        _id: userId,
        email,
      },
      products: productsMapped,
      totalAmount,
      status: "pending",
    };

    return await OrdersModel.create(newOrder);
  }

  async deleteOrder(orderId) {
    return await OrdersModel.findByIdAndDelete(orderId);
  }
}
