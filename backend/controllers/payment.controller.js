import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

// Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid or empty product list" });
    }

    let totalAmount = 0;

    //lineItems name used by stripe
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // stripe need amount in cents format $10 = 1000
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product?.quantity || 1,
      };
    });

    // Optional coupon logic
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    // if total amount is more than $200 then gift coupon for next order
    if (totalAmount >= 200000) {
      await createNewCoupon(req.user._id);
    }

    console.log("Created Stripe session:", session.id);
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.log("Error in createCheckoutSession Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Handle success after payment
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    // to get the particular session by id of stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          { isActive: false }
        ); // this used to update coupon active status in DB , first {} to give to location that which record we have to update and second {} is used to what we have to update in it
      }
      //create a new order
      const products = JSON.parse(session.metadata.products);

      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });

      await newOrder.save();

      res.status(200).json({
        success: true,
        message:
          "Payment successfully, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.log("Error in checkoutSuccess Controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createStripeCoupon = async (discountPercentage) => {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
};

const createNewCoupon = async (userId) => {
  // .random -> Generates a random floating-point number between 0 (inclusive) and 1 (exclusive), e.g.,0.827348723.
  // .toString(36) -> Converts the number to a base-36 string (digits + letters), e.g.,"0.827348723" → "0.x5zkci".
  // .substring(2, 8) -> Removes the leading "0." and extracts the next 6 characters."0.x5zkci" → "x5zkci".
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });

  await newCoupon.save();
  return newCoupon;
};
