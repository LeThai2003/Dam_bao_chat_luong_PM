const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/order.controller");

router.get("/", controller.index);

router.get("/detail/:orderId", controller.detail);

router.patch("/update-status/:orderId", controller.updateStatus);

module.exports = router;