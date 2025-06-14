const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // user_id: String,
    cart_id: String,
    userInfo: {
      fullName: String,
      phone: String,
      address: String
    },
    products: [
      {
        product_id: String,
        price: Number,
        discountPercentage: Number,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      enum: ['Created', 'Confirmed', 'Processing', 'Shipping', 'Delivered', 'Cancelled-Admin', 'Cancelled-Client'], // Khởi tạo, Đã xác nhận (admin thấy đơn), Đang xử lý (Chuẩn bị, đóng gói), Đang giao hàng, Đã giao hàng, Đã hủy
      default: 'Created'
    }
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;