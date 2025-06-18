jest.mock('../../models/product.model');
jest.mock('../../models/product-category.model', () => ({
  find: jest.fn(),
}));
jest.mock('../../helpers/create-tree.helper', () => jest.fn());

const createTreeHelper = require('../../helpers/create-tree.helper');
const productController = require('../../controllers/admin/product.controller');
const mockFindCategory = require('../../models/product-category.model').find;
const Product = require('../../models/product.model');

describe('Admin Product Controller', () => {
  describe('GET /admin/products/create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render create product page with categories', async () => {
      const req = {};
      const res = {
        render: jest.fn(),
        redirect: jest.fn(),
        flash: jest.fn(),
      };

      mockFindCategory.mockResolvedValueOnce([
        { _id: 'cat1', name: 'Category 1', parentId: null },
      ]);

      createTreeHelper.mockReturnValueOnce([
        { _id: 'cat1', name: 'Category 1', children: [] },
      ]);

      await productController.create(req, res);

      expect(mockFindCategory).toHaveBeenCalledWith({ deleted: false });
      expect(res.render).toHaveBeenCalledWith('admin/pages/products/create', {
        pageTitle: 'Thêm mới sản phẩm',
        records: expect.any(Array),
      });
    });

    it('should handle error and redirect back', async () => {
      const req = {
        flash: jest.fn(),
      };
      const res = {
        render: jest.fn(),
        redirect: jest.fn(),
        flash: jest.fn(),
      };

      mockFindCategory.mockRejectedValueOnce(new Error('Mongo error'));

      await productController.create(req, res);

      expect(req.flash).toHaveBeenCalledWith('error', 'Có lỗi xảy ra');
      expect(res.redirect).toHaveBeenCalledWith('back');
    });
  });

  describe('POST /admin/products/create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a product successfully and redirect', async () => {
      const req = {
        body: {
          title: 'Sản phẩm A',
          price: '100000',
          discountPercentage: '10',
          stock: '50',
          position: '',
          categoryId: 'cat1',
          description: 'desc',
        },
        flash: jest.fn(),
      };

      const res = {
        redirect: jest.fn(),
        locals: {
          user: {
            id: 'adminId',
          },
        },
      };

      // Mock countDocuments trả về 5 sản phẩm
      Product.countDocuments = jest.fn().mockResolvedValueOnce(5);

      const mockSave = jest.fn().mockResolvedValueOnce({});
      Product.mockImplementation(() => ({
        save: mockSave,
      }));

      await productController.createPost(req, res);

      expect(Product.countDocuments).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();

      expect(req.body.position).toBe(6); // Tự động tăng
      expect(req.body.createdBy.accountId).toBe('adminId');

      expect(req.flash).toHaveBeenCalledWith('success', 'Thêm mới sản phẩm thành công!');
      expect(res.redirect).toHaveBeenCalledWith('/admin/products');
    });

    it('should handle error and redirect back', async () => {
      const req = {
        body: {
          title: 'Sản phẩm lỗi',
          price: 'abc', // gây lỗi parseInt
          discountPercentage: 'abc',
          stock: 'abc',
          position: '',
        },
        flash: jest.fn(),
      };

      const res = {
        redirect: jest.fn(),
        locals: {
          user: {
            id: 'adminId',
          },
        },
      };

      // Gây lỗi từ Product
      Product.countDocuments = jest.fn().mockResolvedValueOnce(2);
      Product.mockImplementation(() => ({
        save: jest.fn().mockRejectedValueOnce(new Error('DB error')),
      }));

      jest.spyOn(console, 'log').mockImplementation(() => {}); // chặn log lỗi

      await productController.createPost(req, res);

      expect(req.flash).toHaveBeenCalledWith('error', 'Thêm mới sản phẩm không thành công!');
      expect(res.redirect).toHaveBeenCalledWith('back');
    });
  });
});
