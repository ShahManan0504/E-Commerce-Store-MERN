import express from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts); // this will get all products from the DB to admin, as this will be only access by admin
router.get("/featured", getFeaturedProducts); // this is featured product as admin can make any product featured so this can be watch by every user even if user is log in or not then also user can check it
router.get("/category/:category", getProductsByCategory); // this will give product according to category to all user, on bases of category name which we can get from params
router.get("/recommendations", getRecommendedProducts); // this will show random 3 product as recommendation
router.post("/", protectRoute, adminRoute, createProduct); // this will use to create product
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct); // this will use to make product as featured product , on bases of id from params
router.delete("/:id", protectRoute, adminRoute, deleteProduct); // this will use to delete product , on bases of id which we get from params

//put -> use it when you update full object or more fields
//patch -> use it when you update less fields
//delete -> use it for deleting any product with help of id
//get -> to give data to client side
//post -> get some data from client side and then give success or any kind of data according to given data
export default router;
