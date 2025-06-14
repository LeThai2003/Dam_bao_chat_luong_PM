const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");

// [GET] /orders/
module.exports.index = async (req, res) => {

  const cartId = req.cookies.cartId;

  // Đơn hàng đã giao thành công hoặc đã hủy
  const ordersHistory = await Order.find({
    cart_id: cartId, 
    status: { $in: ["Delivered", "Cancelled-Admin", "Cancelled-Client"]}
  });

  if(ordersHistory.length > 0)
  {
    for (const order of ordersHistory) {
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

      order.statusVi = (order.status == "Delivered" ? "Đã giao" 
        : "Đã hủy"
      );

      console.log(order.statusVi);
    }
  }

  console.log(ordersHistory);
  // Đơn hàng mới
  const ordersRecent = await Order.find({
    cart_id: cartId, 
    status: ["Created", "Confirmed", "Processing", "Shipping"]
  });

  if(ordersRecent.length > 0)
  {
    for (const order of ordersRecent) {
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
      : "Đang giao");

      console.log(order.statusVi);
    }
  }
  

  console.log(ordersRecent);
  
  res.render("client/pages/orders/index", {
    pageTitle: "Trang đơn hàng",
    ordersHistory,
    ordersRecent
  });
}

// [GET] /orders/detail/:orderId
module.exports.detail = async (req, res) => {

  const orderId = req.params.orderId

  const order = await Order.findOne({
    _id: orderId
  });

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

    order.statusVi = (order.status == "Created" ? "Mới tạo" 
      : order.status == "Confirmed" ? "Đã xác nhận"
      : order.status == "Processing" ? "Đang đóng gói"
      : order.status == "Delivered" ? "Đang giao"
      : "Đã hủy"
    );
  }

  let cancleEnable = (
    ['Created', 'Confirmed', 'Processing'].includes(order.status) ? true : false
  ) 

  res.render("client/pages/orders/detail", {
    pageTitle: "Trang chi tiết đơn hàng",
    order,
    cancleEnable
  });
}

// [PATCH] /orders/update-status/:orderId
module.exports.updateStatus = async (req, res) => {

  const orderId = req.params.orderId

  const order = await Order.findOne({
    _id: orderId
  });

  if(['Created', 'Confirmed', 'Processing'].includes(order.status))
  {
    await Order.updateOne({_id: orderId}, {status: "Cancelled-Client"});
  }
  else
  {
    req.flash("error", "Đơn hàng không được xóa");
  }
  
  res.redirect("back");
}