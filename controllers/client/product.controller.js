  const Product = require("../../models/product.model");
  const ProductCategory = require("../../models/product-category.model");
  const paginationHelper = require("../../helpers/pagination.helper");
  const { convertToSlug } = require("../../helpers/convertToSlug");

  // [GET] /products/
  module.exports.index = async (req, res) => {

    let find = {
      status: "active",
      deleted: false
    }

    // Pagination
    const countProducts = await Product.countDocuments(find);
    const objectPagination = paginationHelper(2, req.query, countProducts);
    // End Pagination

    // Search
    if(req.query.keyword) {
      const keywordSlug = convertToSlug(req.query.keyword);
      find.slug = {$regex: keywordSlug};
    }
    // End Search
    
    // Sort
    const sort = {};
    if(req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort["price"] = "desc";
    }
    // End Sort

    const products = await Product.find(find)
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    for (const item of products) {
      item.priceNew = item.price * (1 - item.discountPercentage/100);
      item.priceNew = item.priceNew.toFixed(0);
    }

    // console.log(objectPagination);

    res.render("client/pages/products/index", {
      pageTitle: "Danh sách sản phẩm",
      products: products,
      keyword: req.query.keyword,
      pagination: objectPagination

    });
  }

  // [GET] /products/:slugCategory
  module.exports.category = async (req, res) => {
    const slugCategory  = req.params.slugCategory;
    
    const category = await ProductCategory.findOne({
      slug: slugCategory,
      status: "active",
      deleted: false
    });

    const getSubCategory = async (parentId) => {
      const subs = await ProductCategory.find({
        parent_id: parentId,
        status: "active",
        deleted: false
      });

      let allSubs = [...subs];

      for(const sub of subs) {
        const childs = await getSubCategory(sub.id);
        allSubs = allSubs.concat(childs);
      }

      return allSubs;
    }
    
    const allCagegory = await getSubCategory(category.id);

    const allCagegoryId = allCagegory.map(item => item.id);

    let find = {
      product_category_id: {
        $in: [
          category.id,
          ...allCagegoryId
        ]
      },
      status: "active",
      deleted: false
    }

    // Search
    if(req.query.keyword) {
      const keywordSlug = convertToSlug(req.query.keyword);
      find.slug = {$regex: keywordSlug};
    }
    // End Search
    
    // Sort
    const sort = {};
    if(req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort["price"] = "desc";
    }
    // End Sort

    // Pagination
    const countProducts = await Product.countDocuments(find);
    const objectPagination = paginationHelper(8, req.query, countProducts);
    // End Pagination

    const products = await Product.find(find)
      .sort(sort)
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip);

    for (const item of products) {
      item.priceNew = (item.price * (100 - item.discountPercentage)/100).toFixed(0);
    }
    
    res.render("client/pages/products/index", {
      pageTitle: "Danh sách sản phẩm",
      products: products,
      keyword: req.query.keyword,
      pagination: objectPagination
    });
  }

  // [GET] /products/:slugProduct
  module.exports.detail = async (req, res) => {
    try {
      const slug = req.params.slugProduct;

      const product = await Product.findOne({
        slug: slug,
        deleted: false,
        status: "active"
      });

      product.priceNew = (product.price * (100 - product.discountPercentage)/100).toFixed(0);

      if(product.product_category_id) {
        const category = await ProductCategory.findOne({
          _id: product.product_category_id
        });

        product.category = category;
      }

      res.render("client/pages/products/detail", {
        pageTitle: product.title,
        product: product
      });
    } catch (error) {
      res.redirect("/");
    }
  }