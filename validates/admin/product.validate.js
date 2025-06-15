module.exports.createPost = async (req, res, next) => {
  if(!req.body.title) {
    req.flash("error", "Tiêu đề không được để trống!");
    res.redirect("back");
    return;
  }

  if(req.body.title.length < 5) {
    req.flash("error", "Tiêu đề phải chứa ít nhất 5 ký tự!");
    res.redirect("back");
    return;
  }

  if (!req.body.price || isNaN(req.body.price) || Number(req.body.price) <= 0) {
    req.flash("error", "Giá phải là số lớn hơn 0!");
    return res.redirect("back");
  }

  if (!req.body.stock || isNaN(req.body.stock) || Number(req.body.stock) < 0) {
    req.flash("error", "Số lượng phải là số lớn hơn hoặc bằng 0!");
    return res.redirect("back");
  }

  if (req.body.discountPercentage && (isNaN(req.body.discountPercentage) || Number(req.body.discountPercentage) < 0 || Number(req.body.discountPercentage) > 100)) {
    req.flash("error", "% Giảm giá phải là số từ 0 đến 100!");
    return res.redirect("back");
  }
  
  next();
}