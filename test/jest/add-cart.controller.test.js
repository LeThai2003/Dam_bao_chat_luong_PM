const fs = require('fs');
const path = require('path');

// Tạo thư mục result nếu chưa có
const resultDir = path.join(__dirname, '../../result');
if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
}

const fileBase = 'add-cart.controller';
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

const mockCartExec = jest.fn();
const mockUpdateOne = jest.fn();

// Mock Cart model
jest.mock('../../models/cart.model', () => ({
  findOne: jest.fn(() => ({ exec: mockCartExec })),
  updateOne: mockUpdateOne
}));

const Cart = require('../../models/cart.model');
const cartController = require('../../controllers/client/cart.controller');

describe('Cart Controller - addPost', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {
        productId: 'mock-product-id'
      },
      body: {
        quantity: '2'
      },
      cookies: {
        cartId: 'mock-cart-id'
      },
      flash: jest.fn()
    };

    res = {
      redirect: jest.fn()
    };
  });

  testWithLog('should update quantity if product already exists in cart', async () => {
    const mockCart = {
      _id: 'mock-cart-id',
      products: [
        { product_id: 'mock-product-id', quantity: 1 }
      ]
    };

    mockCartExec.mockResolvedValueOnce(mockCart);
    mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });

    await cartController.addPost(req, res);

    expect(Cart.findOne).toHaveBeenCalledWith({ _id: 'mock-cart-id' });
    expect(mockCartExec).toHaveBeenCalled();
    expect(Cart.updateOne).toHaveBeenCalledWith(
      { _id: 'mock-cart-id', 'products.product_id': 'mock-product-id' },
      { $set: { 'products.$.quantity': 3 } }
    );
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  testWithLog('should add product if it does not exist in cart', async () => {
    const mockCart = {
      _id: 'mock-cart-id',
      products: []
    };

    mockCartExec.mockResolvedValueOnce(mockCart);
    mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });

    await cartController.addPost(req, res);

    expect(Cart.findOne).toHaveBeenCalledWith({ _id: 'mock-cart-id' });
    expect(mockCartExec).toHaveBeenCalled();
    expect(Cart.updateOne).toHaveBeenCalledWith(
      { _id: 'mock-cart-id' },
      {
        $push: {
          products: {
            product_id: 'mock-product-id',
            quantity: 2
          }
        }
      }
    );
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  testWithLog('should handle error and flash error message', async () => {
    mockCartExec.mockRejectedValueOnce(new Error('DB error'));

    await cartController.addPost(req, res);

    expect(Cart.findOne).toHaveBeenCalledWith({ _id: 'mock-cart-id' });
    expect(mockCartExec).toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith('error', expect.stringContaining('không thành công'));
    expect(res.redirect).toHaveBeenCalledWith('back');
  });
});
