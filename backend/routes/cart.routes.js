import express from "express";
import {
  addToCart,
  updateQuantity,
  removeAllFromCart,
  getCartProducts,
} from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts); // to get all products which are in cart
router.post("/", protectRoute, addToCart); // to add product in cart
router.delete("/", protectRoute, removeAllFromCart); // to remove full product from the cart
router.put("/:id", protectRoute, updateQuantity); // to increase decrease the product quantity from the cart

export default router;
