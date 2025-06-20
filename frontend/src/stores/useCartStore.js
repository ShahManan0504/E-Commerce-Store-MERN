import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subtotal: 0,

  getCartItems: async () => {
    try {
      const response = await axios.get("/cart");
      set({ cart: response.data });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response.data.message || "Failed to get cart product.");
    }
  },

  addToCart: async (product) => {
    try {
      const response = await axios.post("/cart", { productId: product._id });
      set((state) => {
        const existingProduct = state.cart.find(
          (item) => item._id === product._id
        );
        const newCart = existingProduct
          ? state.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...state.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      toast.success("Product added to cart!");
      get().calculateTotals();
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error(
        error.response.data.message || "Failed to add product to cart."
      );
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subtotal;

    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    set({ subtotal, total });
  },

  updateQuantity: async (productId, quantity) => {
    try {
      if (quantity == 0) {
        get().removeFromCart(productId);
        return;
      }

      await axios.put(`/cart/${productId}`, { quantity });
      set((state) => ({
        cart: state.cart.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        ),
      }));
      get().calculateTotals();
      toast.success("Product quantity updated in cart!");
    } catch (error) {
      console.error("Error updating product quantity in cart:", error);
      toast.error(
        error.response.data.message ||
          "Failed to updating product quantity in cart."
      );
    }
  },

  removeFromCart: async (productId) => {
    try {
      await axios.delete(`/cart`, { data: { productId } });
      set((state) => ({
        cart: state.cart.filter((item) => item._id !== productId),
      }));
      get().calculateTotals();
      toast.success("Product removed from cart!");
    } catch (error) {
      console.error("Error remove product from cart:", error);
      toast.error(
        error.response.data.message || "Failed to remove product from cart."
      );
    }
  },
}));
