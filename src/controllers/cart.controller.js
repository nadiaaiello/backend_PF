import CartService from "../services/cart.service.js";
import cartsModel from "../services/models/carts.model.js";

const cartService = new CartService();

export const getAllCarts = async (req, res) => {
  try {
    const carts = await this.cartService.getAll();
    res.status(200).json(carts);
  } catch (error) {
    console.log("Error fetching carts:", error);
    res.status(500).json({ error: "Error fetching carts" });
  }
};

// Get cart by user ID
export const getCartByUserId = async (req, res) => {
  const User = req.user.user;
  const ID = User._id; // Get the user ID from the token
  console.log("User ID from token:", ID); // Log the user ID to see if it's set

  try {
    const cart = await cartService.getCartByUserId(ID);
    if (cart) {
      res.status(200).json(cart);
    } else {
      res.status(404).json({ error: `Cart not found for user ID: ${uid}` });
    }
  } catch (error) {
    console.log("Error fetching cart by user ID:", error);
    res.status(500).json({ error: "Error fetching cart by user ID" });
  }
};

// Get cart by cart ID
export const getCartById = async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await cartService.getById(cid);
    if (cart) {
      res.status(200).json(cart);
    } else {
      res.status(404).json({ error: `Cart not found for ID: ${cid}` });
    }
  } catch (error) {
    console.log("Error fetching cart by ID:", error);
    res.status(500).json({ error: "Error fetching cart by ID" });
  }
};

// Add product to cart
export const addProductToCart = async (req, res) => {
  const { cid, pid } = req.params;
  try {
    // Assume the quantity is passed in the body
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid product quantity" });
    }

    // Retrieve the cart
    const cart = await cartService.getById(cid);

    if (!cart) {
      return res.status(404).json({ error: `Cart not found for ID: ${cid}` });
    }

    // Check if the product already exists in the cart
    const productIndex = cart.products.findIndex(
      (item) => item.product._id.toString() === pid
    );

    if (productIndex >= 0) {
      // Update the quantity of the existing product in the cart
      cart.products[productIndex].quantity += quantity;
    } else {
      // Add the new product to the cart
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.log("Error adding product to cart:", error);
    res.status(500).json({ error: "Error adding product to cart" });
  }
};

// Remove product from cart
export const removeProductFromCart = async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await cartService.removeProduct(cid, pid);
    res.status(200).json(cart);
  } catch (error) {
    console.log("Error removing product from cart:", error);
    res.status(500).json({ error: "Error removing product from cart" });
  }
};

export const updateProduct = async (req, res) => {
  const { cid, pid } = req.params;
  //console.log(cid);
  const { action } = req.body;

  try {
    // Verificar que el carrito existe
    const cart = await cartService.getById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    // Verificar si el producto está en el carrito
    const productIndex = cart.products.findIndex(
      (item) => item.product._id.toString() === pid
    );
    //console.log("product index:", productIndex);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found in the cart." });
    }

    // Actualizar la cantidad según la acción
    if (action === "increase") {
      cart.products[productIndex].quantity += 1;
    } else if (action === "decrease") {
      if (cart.products[productIndex].quantity > 1) {
        cart.products[productIndex].quantity -= 1;
      } else {
        // Si la cantidad llega a 0, eliminar el producto del carrito
        cart.products.splice(productIndex, 1);
      }
    } else {
      return res
        .status(400)
        .json({ error: 'Invalid action. Use "increase" or "decrease".' });
    }

    // Guardar los cambios en la base de datos
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating product quantity:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// export const clearCart = async (req, res) => {
//   const userId = req.user.user._id; // Obtener el ID del usuario autenticado desde el token

//   try {
//     const cart = await cartService.getCartByUserId(userId);
//     if (!cart) {
//       return res.status(404).json({ error: "Cart not found." });
//     }

//     // Vaciar los productos del carrito
//     cart.products = [];
//     await cart.save();

//     res.status(200).json({ message: "Cart cleared successfully." });
//   } catch (error) {
//     console.error("Error clearing cart:", error);
//     res.status(500).json({ error: "Error clearing cart." });
//   }
// };

export const deleteCart = async (id) => {
  return await Cart.findByIdAndDelete(id);
};

export const checkout = async (req, res) => {
  try {
    const userId = req.user.user._id; // Assuming you have user info in req.user
    const cart = await cartService.getCartByUserId(userId);
    //console.log("userId", userId);
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const order = await cartService.checkout(cart._id, userId);

    res
      .status(200)
      .json({ message: "Checkout successful", orderId: order._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

