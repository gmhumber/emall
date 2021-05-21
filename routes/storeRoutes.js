// Import the required modules and create the Express Router application object
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.get('/', storeController.index);

router.get('/products', storeController.products);

router.post('/cart', storeController.cart);

router.get('/reviewOrder', storeController.reviewOrder);

router.post('/removeItem', storeController.removeItem);

router.post('/submitOrder', storeController.submitOrder);

router.get('/login', storeController.login);

router.post('/postLogin', storeController.postLogin);

router.get('/createUser', storeController.createUser);

router.post('/postCreateUser', storeController.postCreateUser);

router.get('/logout', storeController.logout);




// Export objects
module.exports = router;