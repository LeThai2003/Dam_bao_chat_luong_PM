const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/checkout.controller");
const checkoutMiddleware = require("../../middlewares/client/checkout.middleware");
const checkoutValidate = require("../../validates/client/checkout.validate");

router.get("/", checkoutMiddleware.checkout, controller.index);

// router.get("/", checkoutMiddleware.checkout, controller.index);

router.post("/order", checkoutValidate.checkOrder, checkoutMiddleware.checkoutOrder, checkoutMiddleware.order, controller.order);

router.get("/success/:orderId", controller.success);

module.exports = router;