import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push(productId);
    }

    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params; // this how we can rename variable will destructuring
    const { quantity } = req.body;
    const user = req.user;
    const exisitingItem = user.cartItems.find(
      (items) => items.id === productId
    );
    if (exisitingItem) {
      if (quantity === 0) {
        user.cartItems.find((items) => items.id !== productId);
        await user.save();
        return res.status(200).json(user.cartItems);
      }

      exisitingItem.quantity = quantity;
      await user.save();
      res.status(200).json(user.cartItems);
    } else {
      return res.status(404).json("Product not found");
    }
  } catch (error) {
    console.log("Error in updateQuantity Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in removeAllFromCart Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const user = req.user;
    const products = await Product.find({ _id: { $in: user.cartItems } });
    // add quantity for all products
    const cartItems = products.map((product) => {
      const items = user.cartItems.find((items) => items.id === product.id);
      return { ...product.toJSON(), quantity: items.quantity };
    });
    res.status(200).json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
