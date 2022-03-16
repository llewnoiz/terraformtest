const express = require('express');
const launcherController = require("../controller/launcher.controller");
const router = express.Router();

router.post('/apply',   launcherController.apply);
router.post('/destory', launcherController.destory);

module.exports = router;
