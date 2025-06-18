const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

// [GET] /cart/
module.exports.index = async (req, res) => {
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({
    _id: cartId
  }).exec();

  cart.totalPrice = 0;

  if(cart.products != undefined && cart.products.length > 0) {
    for (const item of cart.products) {
      const product = await Product.findOne({
        _id: item.product_id
      }).select("thumbnail title slug price discountPercentage").exec();

      product.priceNew = (product.price * (100 - product.discountPercentage)/100).toFixed(0);

      item.productInfo = product;

      item.totalPrice = item.quantity * product.priceNew;

      cart.totalPrice += item.totalPrice;
    }
  }

  const notes = req.session.notes || [];
  delete req.session.notes;

  res.render("client/pages/cart/index", {
    pageTitle: "Giỏ hàng",
    cartDetail: cart,
    notes
  });
};

// [POST] /cart/add/:productId
module.exports.addPost = async (req, res) => {
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity);
  const cartId = req.cookies.cartId;

  try {
    const cart = await Cart.findOne({
      _id: cartId
    }).exec();

    const existProductInCart = cart?.products?.find(item => item.product_id == productId);

    if(existProductInCart) {
      const quantityNew = existProductInCart.quantity + quantity;
      
      await Cart.updateOne({
        _id: cartId,
        "products.product_id": productId
      }, {
        $set: { "products.$.quantity": quantityNew }
      }).exec();
    } else {
      const objectCart = {
        product_id: productId,
        quantity: quantity,
      };

      await Cart.updateOne(
        { _id: cartId },
        {
          $push: { products: objectCart },
        }
      ).exec();
    }

    req.flash("success", `Đã thêm sản phẩm vào giỏ hàng!`);
  } catch (error) {
    req.flash("error", `Thêm sản phẩm vào giỏ hàng không thành công!`);
  }

  res.redirect("back");
};

// [GET] /cart/delete/:productId
module.exports.delete = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;

  if (!cartId || !productId) {
    req.flash("error", "Không xác định được giỏ hàng hoặc sản phẩm!");
    return res.redirect("back");
  }

  try {
    await Cart.updateOne(
      { _id: cartId },
      { $pull: { products: { product_id: productId } } }
    );

    req.flash("success", "Đã xóa sản phẩm khỏi giỏ hàng!");
  } catch (err) {
    req.flash("error", "Lỗi xóa sản phẩm khỏi giỏ hàng!");
  }

  res.redirect("back");
};
// [GET] /update/:productId/:quantity
module.exports.update = async (req, res) => {
  const cartId = req.cookies.cartId;
  const productId = req.params.productId;
  const quantity = req.params.quantity;

  if (!cartId || !productId || !quantity) {
    return res.redirect("back");
  }

  try {
    if (Number(quantity) <= 0) {
      const result = await Cart.updateOne(
        { _id: cartId },
        { $pull: { products: { product_id: productId } } }
      );

      if (result.modifiedCount === 0) {
        req.flash("warning", "Không tìm thấy sản phẩm để xóa!");
      } else {
        req.flash("success", "Sản phẩm đã được xóa khỏi giỏ hàng!");
      }
    } else {
      const result = await Cart.updateOne(
        { _id: cartId, "products.product_id": productId },
        { $set: { "products.$.quantity": quantity } }
      );

      if (result.modifiedCount === 0) {
        req.flash("warning", "Không tìm thấy sản phẩm để cập nhật!");
      } else {
        req.flash("success", "Cập nhật số lượng thành công!");
      }
    }
  } catch (error) {
    console.error(error);
    req.flash("error", "Đã xảy ra lỗi. Vui lòng thử lại!");
  }

  res.redirect("back");
};
