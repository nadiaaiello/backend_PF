import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    email: { type: String, required: true },
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, required: false },
      title: { type: String, required: false },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "sent"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const ordersModel = mongoose.model("orders", orderSchema);
export default ordersModel;
