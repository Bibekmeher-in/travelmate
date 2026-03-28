const express = require('express');
const router = express.Router();
const { estimateFare, getTransportFromUser, getRoute } = require('../controllers/transportController');

router.get('/fare', estimateFare);
router.get('/from-user', getTransportFromUser);
router.get('/route', getRoute);

module.exports = router;