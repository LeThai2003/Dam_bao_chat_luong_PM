const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");


module.exports.checkout = async (req, res, next) => {

  console.log(req.query.data);
  const data = req.query.data.split(",");   // [ '684a928167d31f14d1a42984-1', '684a9eb00a6f9165993e16bf-4' ]
  
  req.note = []; 

  if(data.length > 0) {
    for (const item of data) {

      const productId = item.split("-")[0];
      const quantity = item.split("-")[1];

      const product = await Product.findOne({
        _id: productId
      }).select("title stock");

      // Trường hợp 2 - số lượng tồn của món hàng(product_id) nhỏ hơn số lượng người dùng mua thì lúc này sẽ xuất ra thông báo để người dùng biết và thay đổi


      // Trường hợp 3 - người dùng mua 3 món hàng thì A có số lượng tồn đáp ứng nhưng số lượng tồn của B và C thì đã hết => Xuất ra thông báo rằng B và C đã hết hàng và dừng lại luôn

      if(product.stock == 0){
        req.note.push({
          productId: productId,
          content: `Sản phẩm <strong>"${product.title}"</strong> đã hết hàng!`,
          type: "out-of-stock"
        })
      } else if (product.stock < quantity) {
        req.note.push({
          productId: product._id,
          content: `Sản phẩm <strong>"${product.title}"</strong> chỉ còn <strong>${product.stock}</strong> sản phẩm. Vui lòng điều chỉnh số lượng!`,
          type: "under-stock"
        })
      }
    }
  }

  next();
}

module.exports.checkoutOrder = async (req, res, next) => {
  
  console.log("----------------------1--------------------")
  const cart = await Cart.findOne({_id: req.cookies.cartId});

  console.log(cart.products);
  
  req.note = []; 

  if(cart.products.length > 0) {
    for (const item of cart.products) {

      const product = await Product.findOne({
        _id: item.product_id
      }).select("title stock");

      // Trường hợp 2 - số lượng tồn của món hàng(product_id) nhỏ hơn số lượng người dùng mua thì lúc này sẽ xuất ra thông báo để người dùng biết và thay đổi


      // Trường hợp 3 - người dùng mua 3 món hàng thì A có số lượng tồn đáp ứng nhưng số lượng tồn của B và C thì đã hết => Xuất ra thông báo rằng B và C đã hết hàng và dừng lại luôn

      if(product.stock == 0){
        req.note.push({
          productId: product._id,
          content: `Sản phẩm <strong>"${product.title}"</strong> đã hết hàng!`,
          type: "out-of-stock"
        })
      } else if (product.stock < Number(item.quantity)) {
        req.note.push({
          productId: product._id,
          content: `Sản phẩm <strong>"${product.title}"</strong> chỉ còn <strong>${product.stock}</strong> sản phẩm. Vui lòng điều chỉnh số lượng!`,
          type: "under-stock"
        })
      }
    }
  }

  next();
}

module.exports.order = async (req, res, next) => {

  console.log("----------------------2--------------------")

  if(req.note.length > 0){
    req.session.notes = req.note;
    req.flash("error", "Chú ý sản phẩm");
    return res.redirect("/cart");
  }

  const cart = await Cart.findOne({_id: req.cookies.cartId});

  console.log(cart.products);

  if(cart.products.length > 0) {
    for (const item of cart.products) {

      const product = await Product.findOne({
        _id: item.product_id
      }).select("title stock");

      // Trường hợp 1 - số lượng tồn của món hàng(product_id) lớn hơn số lượng người dùng mua thì tiến hành trừ đi số lượng tương ứng. Ví dụ: số lượng tồn là 10, người dùng mua 2 thì số lượng tồn còn lại là 8.

      console.log("-----------------3.1------------------");

      const newStock = product.stock - item.quantity;
      await Product.updateOne({
        _id: product._id
      }, {
        stock: newStock
      })

      console.log("-----------------3.2------------------");
    }
  }

  next();
}