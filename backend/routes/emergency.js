const express = require('express');
const router = express.Router();
const { getEmergencyServices, getEmergencyNumbers } = require('../controllers/emergencyController');

router.get('/nearby', getEmergencyServices);
router.get('/numbers', getEmergencyNumbers);

module.exports = router;