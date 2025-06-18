// __tests__/admin/product.controller.test.js

const mockFind = jest.fn(() => ({
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockResolvedValue([]),
}));

const mockCountDocuments = jest.fn();
const mockFindOneAccount = jest.fn();


jest.mock('../../models/product.model', () => ({
  find: mockFind,
  countDocuments: mockCountDocuments,
}));

jest.mock('../../models/account.model', () => ({
  findOne: mockFindOneAccount,
}));

const Product = require('../../models/product.model');
const Account = require('../../models/account.model');
const productController = require('../../controllers/admin/product.controller');

describe('Admin Product Controller - Index', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: {},
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  it('should render product list page with default sort and pagination', async () => {
    // Mock dữ liệu
    const mockProductList = [
      {
        _id: 'p1',
        title: 'Product 1',
        createdBy: { accountId: 'a1' }
      },
    ];
    mockCountDocuments.mockResolvedValueOnce(1);
    mockFind.mockReturnValueOnce({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValueOnce(mockProductList),
    });
    mockFindOneAccount.mockResolvedValueOnce({ fullName: 'Admin User' });

    await productController.index(req, res);

    expect(Product.countDocuments).toHaveBeenCalled();
    expect(Product.find).toHaveBeenCalledWith(expect.objectContaining({ deleted: false }));

    expect(Account.findOne).toHaveBeenCalledWith({ _id: 'a1' });

    expect(res.render).toHaveBeenCalledWith('admin/pages/products/index', expect.objectContaining({
      pageTitle: 'Danh sách sản phẩm',
      products: expect.any(Array),
      filterState: expect.any(Object),
      keyword: undefined,
      pagination: expect.any(Object),
    }));
  });

  it('should handle query with keyword and status', async () => {
    req.query = {
      keyword: 'Laptop',
      status: 'active',
    };

    mockCountDocuments.mockResolvedValueOnce(0);
    mockFind.mockReturnValueOnce({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockResolvedValueOnce([]),
    });

    await productController.index(req, res);

    expect(Product.find).toHaveBeenCalledWith(expect.objectContaining({
      deleted: false,
      status: 'active',
      slug: expect.any(Object),
    }));

    expect(res.render).toHaveBeenCalled();
  });

  it('should redirect to product list on error', async () => {
    mockCountDocuments.mockRejectedValueOnce(new Error('DB Error'));

    await productController.index(req, res);

    expect(res.redirect).toHaveBeenCalledWith('/admin/products');
  });
});
