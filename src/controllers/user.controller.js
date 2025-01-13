import bcrypt from "bcrypt";
import passport from "passport";
import UserService from "../services/user.service.js";
import CartService from "../services/cart.service.js";

const cartService = new CartService();
const userService = new UserService();

export const register = async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    // Validar si el usuario ya existe
    const exist = await userService.findByUsername(email);
    if (exist) {
      return res
        .status(400)
        .send({ status: "error", message: "User already exists" });
    }

    // Crear el usuario
    const hashedPassword = createHash(password);
    const newUser = {
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
    };
    const result = await userService.save(newUser);

    // Crear carrito asociado al usuario
    await cartService.save({ user: result._id, products: [] });

    res.send({
      status: "success",
      message: "User registered successfully",
      user: result,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userService.findByUsername(email);

    if (!user) {
      return res.status(401).send({
        status: "error",
        message: "Invalid credentials: user not found",
      });
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ status: "error", message: "Invalid password" });
    }

    // Obtener carrito de MongoDB
    let cart = await cartService.getCartByUserId(user._id);

    if (!cart) {
      console.log(`No cart found for user ${user._id}. Creating a new cart.`);
      cart = await cartService.save({ user: user._id, products: [] });
    }

    // Combinar el carrito local con el de MongoDB
    const localCart = req.body.localCart || [];
    if (localCart.length > 0) {
      for (const localProduct of localCart) {
        const existingProduct = cart.products.find(
          (p) => p.product.toString() === localProduct.product
        );
        if (existingProduct) {
          existingProduct.quantity += localProduct.quantity;
        } else {
          cart.products.push(localProduct);
        }
      }
      await cartService.update(cart._id, cart); // Guardar los cambios en MongoDB
    }

    // Generar JWT
    const token = generateJWToken({ user });
    res.cookie("jwtCookieToken", token, { httpOnly: true });

    res.send({ status: "success", message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
  }
};

export const github = async (req, res) => {
  try {
    const user = req.user; // Retrieved from GitHub strategy
    //console.log("git", user);
    // Check or create a cart for the user
    let cart = await cartService.getCartByUserId(user._id);
    if (!cart) {
      cart = await cartService.save({ user: user._id, products: [] });
    }

    // Generate JWT
    const token = generateJWToken({ user });
    res.cookie("jwtCookieToken", token, { httpOnly: true });

    res.redirect("/products"); // Redirect to products page
  } catch (error) {
    console.error("Error during GitHub login:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("jwtCookieToken");

    res.send({ status: "success", message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
  }
};

export const getUserbyId = async (req, res) => {
  const User = req.user.user;
  const ID = User._id; // Get the user ID from the token
  console.log("User ID from token:", ID); // Log the user ID to see if it's set

  try {
    const user = await userService.getById(ID); // Fetch user by ID
    if (!user) {
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    }

    res.send({ status: "success", user });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).send({ status: "error", message: "Internal server error" });
  }
};
