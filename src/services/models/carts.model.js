import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      quantity: { type: Number },
    },
  ],
});

const cartsModel = mongoose.model("carts", CartSchema);

export default cartsModel;
