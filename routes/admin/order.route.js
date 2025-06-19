const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/order.controller");

router.get("/", controller.index);

router.get("/update/:id", controller.update);

module.exports = router;