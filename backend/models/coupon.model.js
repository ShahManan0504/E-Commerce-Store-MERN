import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage of coupon is required"],
      min: 0,
      max: 100,
    },
    expirationDate: {
      type: Date,
      required: [true, "Expiration Date of coupon is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
