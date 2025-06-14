module.exports.checkOrder = (req, res, next) => {
  if (!req.body.fullName.trim()) {
    req.flash("error", `Họ tên không được để trống!`);
    res.redirect("back");
    return;
  }

  const nameRegex = /^[a-zA-ZÀ-Ỹà-ỹ\s]+$/;

  if (!nameRegex.test(req.body.fullName.trim())) {
    req.flash("error", "Họ tên không hợp lệ!");
    res.redirect("back");
    return;
  }

  if (!req.body.phone.trim()) {
    req.flash("error", `Số điện thoại không được để trống!`);
    res.redirect("back");
    return;
  }

  const phoneRegex = /^(\+84|0)(3|5|7|8|9)\d{8}$/;

  if (!phoneRegex.test(req.body.phone.trim())) {
    req.flash("error", "Số điện thoại không hợp lệ!");
    res.redirect("back");
    return;
  }

  if (!req.body.address.trim()) {
    req.flash("error", `Địa chỉ không được để trống!`);
    res.redirect("back");
    return;
  }

  next();
};

