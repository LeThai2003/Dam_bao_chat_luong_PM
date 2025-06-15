const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/checkout.controller");
const checkoutMiddleware = require("../../middlewares/client/checkout.middleware");

router.post("/", checkoutMiddleware.checkout, controller.index);

router.post("/order", checkoutMiddleware.checkout, checkoutMiddleware.order, controller.order);

router.get("/success/:orderId", controller.success);

module.exports = router;