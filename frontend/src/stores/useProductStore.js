import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const response = await axios.post("/products", productData);
      set((state) => ({
        products: [...state?.products, response?.data],
      }));
      toast.success("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.response.data.message || "Failed to create product.");
    } finally {
      set({ loading: false });
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products");
      set({ products: response.data.products });
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.response.data.message || "Failed to fetch products.");
    } finally {
      set({ loading: false });
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products });
    } catch (error) {
      console.error("Error fetching featured products:", error);
      toast.error(
        error.response.data.message || "Failed to fetch featured products."
      );
    } finally {
      set({ loading: false });
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`);
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: response.data.isFeatured }
            : product
        ),
      }));
      toast.success("Product featured status updated successfully!");
    } catch (error) {
      console.error("Error toggling featured product:", error);
      toast.error(
        error.response.data.message || "Failed to update featured status."
      );
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((state) => ({
        products: state.products.filter((product) => product._id !== productId),
      }));
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.response.data.message || "Failed to delete product.");
    } finally {
      set({ loading: false });
    }
  },
}));
