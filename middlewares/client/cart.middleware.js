const Cart = require("../../models/cart.model");
const User = require("../../models/user.model");

module.exports.cart = async (req, res, next) => {
  
  const cart = await Cart.findOne({
    _id: req.cookies.cartId
  });

  res.locals.cart = cart;

  next();
}