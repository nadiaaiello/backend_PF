import productsModel from "./models/products.model.js";

export default class ProductService {
  getAll = async () => {
    try {
      // Fetch products from the database
      const products = await productsModel.find();

      if (!products || products.length === 0) {
        console.log("No products found in the database.");
        return []; // Return an empty array if no products are found
      }

      // Log the fetched products for debugging
      //console.log("Fetched products from DB:", products);

      // Return products as plain objects
      return products.map((product) => product.toObject());
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products"); // Throw error to be handled by the route
    }
  };

  save = async (product) => {
    let result = await productsModel.create(product);
    return result;
  };

  getById = async (id) => {
    const result = await productsModel.findOne({ _id: id });
    return result;
  };

  update = async (id, data) => {
    const result = await productsModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return result;
  };

  delete = async (id) => {
    const result = await productsModel.findByIdAndDelete(id);
    return result;
  };
}
