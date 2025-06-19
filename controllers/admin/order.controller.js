const Order = require("../../models/order.model");
const Product = require("../../models/product.model");


// [GET] /admin/dashboard/
module.exports.index = async (req, res) => {
  const orders = await Order.find().sort({createdAt: -1});

  if(orders.length > 0)
  {
    for (const order of orders) {
      order.totalPrice = 0;
  
      for (const product of order.products) {
        const infoProduct = await Product.findOne({
          _id: product.product_id
        });
    
        product.title = infoProduct.title;
        product.thumbnail = infoProduct.thumbnail;
    
        product.priceNew = (product.price * (100 - product.discountPercentage)/100).toFixed(0);
    
        product.totalPrice = product.priceNew * product.quantity;
    
        order.totalPrice += product.totalPrice;
      }

      order.statusVi = (order.status == "Created" ? "Mới tạo" 
        : order.status == "Confirmed" ? "Đã xác nhận"
        : order.status == "Processing" ? "Đang đóng gói"
        : order.status == "Delivered" ? "Đã giao"
        : order.status == "Cancelled-Admin" ? "Đã hủy"
        : "Khách hủy đơn"
      );

      // console.log(order.statusVi);
    }
  }


  res.render("admin/pages/orders/index", {
    pageTitle: "Trang danh sách đơn hàng",
    orders
  });
}

// [GET] /admin/orders/udpate/:id
module.exports.update = async (req, res) => {
  
  res.render("admin/pages/orders/update", {
    pageTitle: "Cập nhật đơn hàng",
  });
}