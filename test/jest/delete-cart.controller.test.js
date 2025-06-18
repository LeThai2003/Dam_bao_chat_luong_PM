

jest.mock('../../models/cart.model');

const Cart = require('../../models/cart.model');
const cartController = require('../../controllers/client/cart.controller');

describe('Cart Controller - delete', () => {
  let req, res;

  beforeEach(() => {
    req = {
      cookies: { cartId: 'mock-cart-id' },
      params: { productId: 'mock-product-id' },
      flash: jest.fn()
    };

    res = {
      redirect: jest.fn()
    };

    Cart.updateOne = jest.fn();
  });

  it('should remove product from cart and flash success message', async () => {
    Cart.updateOne.mockResolvedValue({ modifiedCount: 1 }); // giả lập thành công

    await cartController.delete(req, res);

    expect(Cart.updateOne).toHaveBeenCalledWith(
      { _id: 'mock-cart-id' },
      { $pull: { products: { product_id: 'mock-product-id' } } }
    );

    expect(req.flash).toHaveBeenCalledWith('success', 'Đã xóa sản phẩm khỏi giỏ hàng!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  it('should handle database error', async () => {
    Cart.updateOne.mockRejectedValue(new Error('DB error'));

    await cartController.delete(req, res);

    // Redirect vẫn gọi dù lỗi, controller không throw
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  it('should handle when cartId is missing', async () => {
    req.cookies = {}; // không có cartId

    await cartController.delete(req, res);

    expect(Cart.updateOne).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  it('should handle when productId is missing', async () => {
    req.params = {}; // không có productId

    await cartController.delete(req, res);

    expect(Cart.updateOne).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  it('should handle when cart does not exist or update has no effect', async () => {
    // modifiedCount = 0 nghĩa là không xóa gì cả
    Cart.updateOne.mockResolvedValue({ modifiedCount: 0 });

    await cartController.delete(req, res);

    expect(Cart.updateOne).toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith('success', 'Đã xóa sản phẩm khỏi giỏ hàng!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });
});
