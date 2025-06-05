import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // get all products from DB
    res.json({ products });
  } catch (error) {
    console.log("Error form getAllProducts Controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("feature_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }
    //if not in redis then we have to fetch it from mongodb
    //.lean() is gonna return a plain js object instead of a mongodb document, which is good for performance

    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No feature product found" });
    }

    // if we find product then we store that in redis also

    await redis.set("feature_product", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse.secure_url ? cloudinaryResponse.secure_url : "",
      category,
    });
    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; //this will get the id of image
      try {
        await cloudinary.uploader.destroy(`product/${publicId}`);
        console.log("Image has been deleted from cloudinary");
      } catch (error) {
        console.log("Error will deleting image from cloudinary");
      }
    }

    await Product.findByIdAndDelete(req.params.id); //this will delete product from DB of mongo using id pass in params of api url

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    //aggregate -> take input of query as array
    const products = await Product.aggregate([
      { $sample: { size: 3 } }, // define the number of product we need
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);
    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getProductsByCategory Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updateProduct = await product.save(); // this will save changes in DB
      await updateFeaturedProductsCache();
      res.status(200).json(updateProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateFeaturedProductsCache = async () => {
  try {
    const featuredProducts = (await Product.find({ isFeatured: true })).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error updating cache in updateFeaturedProductsCache");
  }
};
