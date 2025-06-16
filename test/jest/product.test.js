// const request = require('supertest');
// const app = require('../../index.test');
// const Product = require('../../models/product.model');
// const ProductCategory = require('../../models/product-category.model');
// const mongoose = require('mongoose');


// describe('Product Controller Tests', () => {
//   // Test data setup
//   let testCategory;
//   let testProduct;

//   beforeAll(async () => {
//     // Create test category
//     testCategory = await ProductCategory.create({
//       title: 'Test Category',
//       slug: 'test-category',
//       status: 'active',
//       deleted: false
//     });

//     // Create test product
//     testProduct = await Product.create({
//       title: 'Test Product',
//       slug: 'test-product',
//       description: 'Test Description',
//       price: 100,
//       discountPercentage: 10,
//       stock: 50,
//       status: 'active',
//       deleted: false,
//       product_category_id: testCategory._id
//     });
//   });

//   afterAll(async () => {
//     // Clean up test data
//     await Product.deleteMany({});
//     await ProductCategory.deleteMany({});
//     // Close database connection
//     await mongoose.connection.close();
//   });

//   describe('GET /products/', () => {
//     test('should render products page with active products', async () => {
//       const response = await request(app)
//         .get('/products')
//         .expect(200);

//       // Check if the rendered page contains expected elements
//       expect(response.text).toContain('Danh sách sản phẩm');
//       expect(response.text).toContain('Test Product');
//       expect(response.text).toContain('100');
//     });

//     test('should render products page with search results', async () => {
//       const response = await request(app)
//         .get('/products?keyword=test')
//         .expect(200);

//       expect(response.text).toContain('Test Product');
//       expect(response.text).toContain('Danh sách sản phẩm');
//     });

//     test('should render products page with sorted results', async () => {
//       const response = await request(app)
//         .get('/products?sortKey=price&sortValue=desc')
//         .expect(200);

//       expect(response.text).toContain('Test Product');
//       expect(response.text).toContain('Danh sách sản phẩm');
//     });
//   });

//   describe('GET /products/:slugCategory', () => {
//     test('should render category products page', async () => {
//       const response = await request(app)
//         .get(`/products/${testCategory.slug}`)
//         .expect(200);

//       expect(response.text).toContain('Test Product');
//       expect(response.text).toContain('Danh sách sản phẩm');
//     });

//     // test('should render empty page for non-existent category', async () => {
//     //   const response = await request(app)
//     //     .get('/products/non-existent-category')
//     //     .expect(200);

//     //   expect(response.text).not.toContain('Test Product');
//     //   expect(response.text).toContain('Danh sách sản phẩm');
//     // });

//     test('should render category products with search results', async () => {
//       const response = await request(app)
//         .get(`/products/${testCategory.slug}?keyword=test`)
//         .expect(200);

//       expect(response.text).toContain('Test Product');
//       expect(response.text).toContain('Danh sách sản phẩm');
//     });
//   });

//   describe('GET /products/detail/:slugProduct', () => {
//     test('should render product detail page', async () => {
//       const response = await request(app)
//         .get(`/products/detail/${testProduct.slug}`)
//         .expect(200);

//       expect(response.text).toContain('Test Product');
//       expect(response.text).toContain('Test Description');
//       expect(response.text).toContain('90'); // Price after discount
//     });

//     test('should redirect to home for non-existent product', async () => {
//       const response = await request(app)
//         .get('/products/detail/non-existent-product')
//         .expect(302);

//       expect(response.header.location).toBe('/');
//     });

//     test('should redirect to home for inactive product', async () => {
//       // Update product to inactive
//       await Product.updateOne(
//         { _id: testProduct._id },
//         { status: 'inactive' }
//       );

//       const response = await request(app)
//         .get(`/products/detail/${testProduct.slug}`)
//         .expect(302);

//       expect(response.header.location).toBe('/');
//     });
//   });

//   // Edge cases
//   describe('Edge Cases', () => {
//     test('should render product without category', async () => {
//       const noCategoryProduct = await Product.create({
//         title: 'No Category Product',
//         slug: 'no-category-product',
//         description: 'Test Description',
//         price: 100,
//         discountPercentage: 0,
//         stock: 50,
//         status: 'active',
//         deleted: false
//       });

//       const response = await request(app)
//         .get(`/products/detail/${noCategoryProduct.slug}`)
//         .expect(200);

//       expect(response.text).toContain('No Category Product');
//     });

//     test('should render product with 100% discount', async () => {
//       const freeProduct = await Product.create({
//         title: 'Free Product',
//         slug: 'free-product',
//         description: 'Test Description',
//         price: 100,
//         discountPercentage: 100,
//         stock: 50,
//         status: 'active',
//         deleted: false
//       });

//       const response = await request(app)
//         .get(`/products/detail/${freeProduct.slug}`)
//         .expect(200);

//       expect(response.text).toContain('Free Product');
//       expect(response.text).toContain('0'); // Price after 100% discount
//     });

//     test('should render paginated products', async () => {
//       // Create multiple products
//       const products = Array(10).fill().map((_, i) => ({
//         title: `Product ${i}`,
//         slug: `product-${i}`,
//         description: 'Test Description',
//         price: 100,
//         discountPercentage: 0,
//         stock: 50,
//         status: 'active',
//         deleted: false
//       }));

//       await Product.insertMany(products);

//       const response = await request(app)
//         .get('/products?page=2')
//         .expect(200);

//       expect(response.text).toContain('Danh sách sản phẩm');
//     });
//   });
// }); 