import userModel from "./models/users.model.js";

export default class UserService {
  getAll = async () => {
    let users = await userModel.find();
    return users.map((user) => user.toObject());
  };

  save = async (user) => {
    let result = await userModel.create(user);
    return result;
  };

  getById = async (id) => {
    try {
      const result = await userModel.findOne({ _id: id });
      if (!result) {
        return null; // Explicitly return null if user is not found
      }
      return result;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw new Error('Error fetching user');
    }
  };
  

  findByUsername = async (username) => {
    const result = await userModel.findOne({ email: username });
    return result;
  };

  update = async (filter, value) => {
    console.log("Update user with filter and value:");
    console.log(filter);
    console.log(value);
    let result = await userModel.updateOne(filter, value);
    return result;
  };

  delete = async (id) => {
    const result = await userModel.findByIdAndDelete(id);
    return result;
  };
}
