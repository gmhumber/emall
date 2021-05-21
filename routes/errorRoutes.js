// Import the required modules and create the Express Router application object
const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');

router.get('/error', errorController.pageError); // handler for general errors

router.use('/', errorController.pageNotFound); // router.use does not require an exact match for the specified path which is suitable for a catch-all error page



// Export objects
module.exports = router;