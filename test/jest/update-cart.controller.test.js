const fs = require('fs');
const path = require('path');

// Tạo thư mục result nếu chưa có
const resultDir = path.join(__dirname, '../../result');
if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
}

const fileBase = 'update-cart.controller';
const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, ''); // YYYYMMDD
const passFile = path.join(resultDir, `${fileBase}.pass.${dateStr}.txt`);
const failFile = path.join(resultDir, `${fileBase}.fail.${dateStr}.txt`);
fs.writeFileSync(passFile, '');
fs.writeFileSync(failFile, '');

function logResult(message, isPass) {
    const now = new Date().toLocaleString('vi-VN', { hour12: false });
    const line = `[${now}] ${message}\n`;
    if (isPass) {
        fs.appendFileSync(passFile, line);
    } else {
        fs.appendFileSync(failFile, line);
    }
}

function testWithLog(name, fn) {
    it(name, async () => {
        try {
            await fn();
            logResult(`${name}: PASSED`, true);
        } catch (err) {
            logResult(`${name}: FAILED - ${err.message}`, false);
            throw err;
        }
    });
}

jest.mock('../../models/cart.model');

const Cart = require('../../models/cart.model');
const cartController = require('../../controllers/client/cart.controller');

describe('Cart Controller - update', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      cookies: { cartId: 'mock-cart-id' },
      params: {
        productId: 'mock-product-id',
        quantity: '3',
      },
      flash: jest.fn(),
    };

    res = {
      redirect: jest.fn(),
    };
  });

  testWithLog('should update quantity if quantity > 0', async () => {
    Cart.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await cartController.update(req, res);

    expect(Cart.updateOne).toHaveBeenCalledWith(
      { _id: 'mock-cart-id', 'products.product_id': 'mock-product-id' },
      { $set: { 'products.$.quantity': '3' } }
    );

    expect(req.flash).toHaveBeenCalledWith('success', 'Cập nhật số lượng thành công!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  testWithLog('should remove product if quantity = 0', async () => {
    req.params.quantity = '0';
    Cart.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await cartController.update(req, res);

    expect(Cart.updateOne).toHaveBeenCalledWith(
      { _id: 'mock-cart-id' },
      { $pull: { products: { product_id: 'mock-product-id' } } }
    );
    expect(req.flash).toHaveBeenCalledWith('success', 'Sản phẩm đã được xóa khỏi giỏ hàng!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  testWithLog('should remove product if quantity < 0', async () => {
    req.params.quantity = '-5';
    Cart.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await cartController.update(req, res);

    expect(Cart.updateOne).toHaveBeenCalledWith(
      { _id: 'mock-cart-id' },
      { $pull: { products: { product_id: 'mock-product-id' } } }
    );
    expect(req.flash).toHaveBeenCalledWith('success', 'Sản phẩm đã được xóa khỏi giỏ hàng!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  testWithLog('should handle update with modifiedCount = 0', async () => {
    Cart.updateOne.mockResolvedValue({ modifiedCount: 0 });

    await cartController.update(req, res);

    expect(Cart.updateOne).toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith('warning', 'Không tìm thấy sản phẩm để cập nhật!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  testWithLog('should handle delete with modifiedCount = 0', async () => {
    req.params.quantity = '0';
    Cart.updateOne.mockResolvedValue({ modifiedCount: 0 });

    await cartController.update(req, res);

    expect(Cart.updateOne).toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith('warning', 'Không tìm thấy sản phẩm để xóa!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  testWithLog('should handle database error during update', async () => {
    Cart.updateOne.mockRejectedValue(new Error('DB error'));

    await cartController.update(req, res);

    expect(req.flash).toHaveBeenCalledWith('error', 'Đã xảy ra lỗi. Vui lòng thử lại!');
    expect(res.redirect).toHaveBeenCalledWith('back'); // vẫn redirect
  });

  testWithLog('should not update if cartId is missing', async () => {
    req.cookies.cartId = undefined;

    await cartController.update(req, res);

    expect(Cart.updateOne).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  testWithLog('should not update if productId is missing', async () => {
    req.params.productId = undefined;

    await cartController.update(req, res);

    expect(Cart.updateOne).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  testWithLog('should not update if quantity is missing', async () => {
    req.params.quantity = undefined;

    await cartController.update(req, res);

    expect(Cart.updateOne).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('back');
  });
});
