const fs = require('fs');
const path = require('path');

// Tạo thư mục result nếu chưa có
const resultDir = path.join(__dirname, '../../result');
if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
}

const fileBase = 'get-cart.controller';
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

// Đặt mock lên đầu file
const mockCartExec = jest.fn();
const mockProductExec = jest.fn();

const mockSelect = jest.fn(() => ({
  exec: mockProductExec
}));

const mockFindOneProduct = jest.fn(() => ({
  select: mockSelect
}));

jest.mock('../../models/cart.model', () => ({
  findOne: jest.fn(() => ({ exec: mockCartExec }))
}));

jest.mock('../../models/product.model', () => ({
  findOne: mockFindOneProduct
}));

const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const cartController = require('../../controllers/client/cart.controller');

describe('Cart Controller - Index', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      cookies: {
        cartId: 'mock-cart-id'
      },
      session: {}
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn()
    };
  });

  testWithLog('should render cart page with empty cart', async () => {
    const mockCart = {
      _id: 'mock-cart-id',
      products: []
    };

    mockCartExec.mockResolvedValueOnce(mockCart);

    await cartController.index(req, res);

    expect(Cart.findOne).toHaveBeenCalledWith({ _id: 'mock-cart-id' });

    expect(res.render).toHaveBeenCalledWith('client/pages/cart/index', {
      pageTitle: 'Giỏ hàng',
      cartDetail: {
        ...mockCart,
        totalPrice: 0
      },
      notes: []
    });
  });

  testWithLog('should render cart page with products and calculate total price', async () => {
    const mockCart = {
      _id: 'mock-cart-id',
      products: [{ product_id: 'product1', quantity: 2 }]
    };

    const mockProduct = {
      _id: 'product1',
      title: 'Test Product',
      price: 100,
      discountPercentage: 0 
    };

    mockCartExec.mockResolvedValueOnce(mockCart);
    mockProductExec.mockResolvedValueOnce(mockProduct);

    await cartController.index(req, res);

    expect(Cart.findOne).toHaveBeenCalledWith({ _id: 'mock-cart-id' });
    expect(Product.findOne).toHaveBeenCalledWith({ _id: 'product1' });
    expect(mockProductExec).toHaveBeenCalled();

    expect(res.render).toHaveBeenCalledWith('client/pages/cart/index', {
      pageTitle: 'Giỏ hàng',
      cartDetail: {
        ...mockCart,
        products: [
          {
            ...mockCart.products[0],
            productInfo: {
              ...mockProduct,
              priceNew: "100"
            },
            totalPrice: 200
          }
        ],
        totalPrice: 200
      },
      notes: []
    });
  });

  testWithLog('should handle session notes', async () => {
    const mockCart = {
      _id: 'mock-cart-id',
      products: []
    };

    req.session.notes = 'Test notes';
    mockCartExec.mockResolvedValueOnce(mockCart);

    await cartController.index(req, res);

    expect(res.render).toHaveBeenCalledWith('client/pages/cart/index', {
      pageTitle: 'Giỏ hàng',
      cartDetail: {
        ...mockCart,
        totalPrice: 0
      },
      notes: 'Test notes'
    });
  });

  testWithLog('should handle multiple products with different prices and quantities', async () => {
    const mockCart = {
      _id: 'mock-cart-id',
      products: [
        { product_id: 'product1', quantity: 2 },
        { product_id: 'product2', quantity: 3 }
      ]
    };

    const mockProduct1 = {
      _id: 'product1',
      title: 'Product 1',
      price: 100,
      discountPercentage: 0
    };

    const mockProduct2 = {
      _id: 'product2',
      title: 'Product 2',
      price: 200,
      discountPercentage: 0
    };

    mockCartExec.mockResolvedValueOnce(mockCart);

    mockProductExec
      .mockResolvedValueOnce(mockProduct1)
      .mockResolvedValueOnce(mockProduct2);

    await cartController.index(req, res);

    expect(Product.findOne).toHaveBeenCalledWith({ _id: 'product1' });
    expect(Product.findOne).toHaveBeenCalledWith({ _id: 'product2' });
    expect(mockProductExec).toHaveBeenCalledTimes(2);

    expect(res.render).toHaveBeenCalledWith('client/pages/cart/index', {
      pageTitle: 'Giỏ hàng',
      cartDetail: {
        ...mockCart,
        products: [
          {
            ...mockCart.products[0],
            productInfo: {
              ...mockProduct1,
              priceNew: "100"
            },
            totalPrice: 200
          },
          {
            ...mockCart.products[1],
            productInfo: {
              ...mockProduct2,
              priceNew: "200"
            },
            totalPrice: 600
          }
        ],
        totalPrice: 800
      },
      notes: []
    });
  });
});
