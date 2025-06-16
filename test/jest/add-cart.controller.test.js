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

  it('should update quantity if product already exists in cart', async () => {
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

  it('should add product if it does not exist in cart', async () => {
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

  it('should handle error and flash error message', async () => {
    mockCartExec.mockRejectedValueOnce(new Error('DB error'));

    await cartController.addPost(req, res);

    expect(Cart.findOne).toHaveBeenCalledWith({ _id: 'mock-cart-id' });
    expect(mockCartExec).toHaveBeenCalled();
    expect(req.flash).toHaveBeenCalledWith('error', expect.stringContaining('không thành công'));
    expect(res.redirect).toHaveBeenCalledWith('back');
  });
});
