import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
  const totalUsers = User.countDocuments();
  const totalProducts = Product.countDocuments();

  const salesData = Order.aggregate([
    {
      $group: {
        _id: null, // it will group all documents together
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const { totalSales, totalRevenue } = salesData[0] || {
    totalRevenue: 0,
    totalSales: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate, // greater then
            $lte: endDate, // lesser then
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // example dailySalesData
    // [
    //   {
    //     _id: "2025-05-06",
    //     sales: 12,
    //     revenue: 1450.75,
    //   },
    //   {
    //     _id: "2025-05-07",
    //     sales: 10,
    //     revenue: 1405.75,
    //   },
    // ];

    const dateArray = getDatesInRange(startDate, endDate);
    //["2025-05-06",... 7 like this in yyyy-mm-dd]

    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);

      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (error) {
    throw error;
  }
};

const getDatesInRange = () => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
