const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");


module.exports.checkout = async (req, res, next) => {

  const cartId = req.cookies.cartId;
  
  const cart = await Cart.findOne({
    _id: cartId
  });

  req.note = []; 

  // note = [
  //   {
  //     productId: "123",
  //     title: "ABC",
  //     content: "Số lượng tồn của sản phẩm ABC chỉ còn 2. Vui lòng chọn lại!"
  //   }
  // ]

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
      } else if (product.stock < item.quantity) {
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


  if(req.note.length > 0){
    req.session.notes = req.note; 
    req.flash("error", "Chú ý sản phẩm.");
    return res.redirect(`/cart`);
  }

  const cartId = req.cookies.cartId;
  
  const cart = await Cart.findOne({
    _id: cartId
  });


  if(cart.products.length > 0) {
    for (const item of cart.products) {
      const product = await Product.findOne({
        _id: item.product_id
      }).select("title stock");

      // Trường hợp 1 - số lượng tồn của món hàng(product_id) lớn hơn số lượng người dùng mua thì tiến hành trừ đi số lượng tương ứng. Ví dụ: số lượng tồn là 10, người dùng mua 2 thì số lượng tồn còn lại là 8.

      const newStock = product.stock - item.quantity;
      await Product.updateOne({
        _id: product._id
      }, {
        stock: newStock
      })
    }
  }

  next();
}