const { convertToSlug } = require("../../helpers/convertToSlug");
const Product = require("../../models/product.model");

// [GET] /search/
module.exports.index = async (req, res) => {
  const keyword = req.query.keyword;

  let products = [];

  if(keyword) {
    const keywordSlug = convertToSlug(keyword);

    products = await Product.find({
      slug: {$regex: keywordSlug},
      status: "active",
      deleted: false
    }).sort({ position: "desc" });
  }

  res.render("client/pages/search/index", {
    pageTitle: "Kết quả tìm kiếm",
    keyword: keyword,
    products: products
  });
};