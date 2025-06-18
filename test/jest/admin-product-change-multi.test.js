const productController = require('../../controllers/admin/product.controller');
const Product = require('../../models/product.model');

jest.mock('../../models/product.model');

// Tạo mock function cho updateMany và updateOne
Product.updateMany = jest.fn();
Product.updateOne = jest.fn();

describe('PATCH /admin/products/change-multi', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      flash: jest.fn(),
    };
    res = {
      redirect: jest.fn(),
      locals: {
        user: {
          id: 'admin123'
        }
      }
    };
  });

  it('should update status to active for multiple products', async () => {
    req.body = {
      type: 'active',
      ids: 'id1, id2'
    };

    Product.updateMany.mockResolvedValueOnce({ modifiedCount: 2 });

    await productController.changeMulti(req, res);

    expect(Product.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ['id1', 'id2'] } },
      { status: 'active' }
    );
    expect(req.flash).toHaveBeenCalledWith('success', 'Cập nhật trạng thái thành công!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  it('should mark multiple products as deleted', async () => {
    req.body = {
      type: 'delete-all',
      ids: 'id1, id2'
    };

    Product.updateMany.mockResolvedValueOnce({ modifiedCount: 2 });

    await productController.changeMulti(req, res);

    expect(Product.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ['id1', 'id2'] } },
      {
        deleted: true,
        deletedBy: expect.objectContaining({
          accountId: 'admin123',
        }),
      }
    );
    expect(req.flash).toHaveBeenCalledWith('success', 'Xóa sản phẩm thành công!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  it('should update positions for multiple products', async () => {
    req.body = {
      type: 'change-position',
      ids: 'id1-2, id2-5'
    };

    Product.updateOne.mockResolvedValueOnce({}).mockResolvedValueOnce({});

    await productController.changeMulti(req, res);

    expect(Product.updateOne).toHaveBeenCalledWith(
      { _id: 'id1' },
      { position: 2 }
    );
    expect(Product.updateOne).toHaveBeenCalledWith(
      { _id: 'id2' },
      { position: 5 }
    );
    expect(req.flash).toHaveBeenCalledWith('success', 'Thay đổi vị trí thành công!');
    expect(res.redirect).toHaveBeenCalledWith('back');
  });

  it('should redirect back for unknown type', async () => {
    req.body = {
      type: 'unknown',
      ids: 'id1, id2'
    };

    await productController.changeMulti(req, res);

    expect(Product.updateMany).not.toHaveBeenCalled();
    expect(Product.updateOne).not.toHaveBeenCalled();
    expect(req.flash).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('back');
  });
});
