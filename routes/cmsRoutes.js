// Import the required modules and create the Express Router application object
const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

router.get('/cmsLogin', cmsController.cmsLogin);

router.post('/postCmsLogin', cmsController.postCmsLogin);

router.get('/cmsProducts', cmsController.cmsProducts);

router.post('/cmsProductAdd', cmsController.cmsProductAdd);

router.post('/cmsProductDelete', cmsController.cmsProductDelete);

router.post('/cmsProductChange', cmsController.cmsProductChange);


// Export objects
module.exports = router;