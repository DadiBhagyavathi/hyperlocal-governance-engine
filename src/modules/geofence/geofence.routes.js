const router = require("express").Router();
const controller = require("./geofence.controller");

router.post("/validate", controller.validateLocation);

module.exports = router;