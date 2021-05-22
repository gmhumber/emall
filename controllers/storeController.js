// Import the necessary modules
const databaseController = require('./databaseController');
const userModel = require('../models/userModel');
const bcryptjs = require('bcryptjs');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const path = require('path');


// Functions to render shopping and ordering pages
function index(req, res, next) {
    const authenticated = req.session.authenticated;
    res.render('index.ejs', {pageTitle: 'eMall Store', authenticated: authenticated });
};

function products(req, res, next) {
    const authenticated = req.session.authenticated;
    const db = databaseController.getDb();
    db.collection('products').find().toArray()
        .then(results => {
            res.render('products.ejs', { 
                productsArray: results, 
                pageTitle: 'Available Products',
                authenticated: authenticated });
        })
        .catch(err => {
            console.log(err);
        });
};

function cart(req, res, next) {
    const authenticated = req.session.authenticated;
    const userEmail = req.session.email;
    const productId = req.body.productId;
    const quantity = parseInt(req.body.quantity);
    const db = databaseController.getDb();
    let cartItemExistsFlag = false;
    let cartArray;
    let newCartItem;

    // Check that user has logged in before proceeding
    if (authenticated !== true) {
        return res.redirect('/login');
    };

    // Validate that the quantity input it acceptable
    if (!quantity || quantity < 1) {
        return res.redirect('/error'); 
    };

    // Get the cart product and user record from the DB and insert the new cart item into the user record's cart field
    db.collection('products').findOne({ _id: ObjectId(productId) })
        .then(productResult => {
            if (!productResult) {
                return res.redirect('/error');
            } else {
                newCartItem = productResult;
                newCartItem['quantity'] = quantity;
    
                // Insert the new cart item into the user's DB record. If the item already exists in the cart then increase the quantity ordered only
                db.collection('users').findOne({ email: userEmail })
                    .then(userResult => {
                        if (!userResult) {
                            return res.redirect('/error');  
                        } else {
                            
                            // Pull the cart array out of the returned DB document
                            cartArray = userResult.cart;

                            // Check if item is already in the cart array
                            if (cartArray.length === 0) {
                                cartArray.push(newCartItem);
                                cartItemExistsFlag = true;
                            } else {
                                cartArray.forEach((element) => {
                                    if (element._id.toString() === productId.toString()) {
                                        element.quantity += quantity;
                                        cartItemExistsFlag = true;
                                    }
                                });                                
                            };
                        
                        if (!cartItemExistsFlag) {
                            cartArray.push(newCartItem);
                        };

                        // Update the DB record with the new modified array
                        db.collection('users').updateOne(
                            { email: userEmail },
                            { $set: { cart: cartArray } }
                        )
                        .then(() => {
                            return res.redirect('/products');
                        })
                        .catch(err => {
                            console.log(err);
                            return res.redirect('/error');
                        });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        return res.redirect('/error');
                    });
            };
        })
        .catch(err => {
            console.log(err);
            return res.redirect('/error');
        });
};

function reviewOrder(req, res, next) {
    const userEmail = req.session.email;
    const authenticated = req.session.authenticated;
    const db = databaseController.getDb();
    let totalCost = 0;
    let userObject;
    let cartArray;

    // Check that user has logged in before proceeding
    if (authenticated !== true) {
        return res.redirect('/login');
    }; 

    // Obtain the cart data from the DB and render the view
    db.collection('users').findOne( { email: userEmail } )
        .then(userResult => {
            if (!userResult) {
                return res.redirect('/error');
            };
            userObject = userResult;
            cartArray = userObject.cart;

            cartArray.forEach(e => {
                totalCost += (e.price * e.quantity);
            });

            res.render('reviewOrder.ejs', { 
                userObject: userObject, 
                cartArray: cartArray,
                totalCost: totalCost, 
                pageTitle: 'Review Your Order',
                authenticated: authenticated });
        }).catch(err => {
            console.log(err);
            return res.redirect('/error');
        }); 
};

function login(req, res, next) {
    const authenticated = req.session.authenticated;

    if (authenticated === true) {
        res.redirect('/');
    } else {
        res.render('login.ejs', { pageTitle: 'User Login', authenticated: authenticated });        
    }

};

function postLogin(req, res, next) {
    const newEmail = req.body.email;
    const newPassword = req.body.password;
    const db = databaseController.getDb();
    const emailRegex = /\w+@\w+\.\w+/;

    // Validate that all form fields have defined values
    if (!(newEmail || newPassword)) {
        return res.redirect('/error');
    };

    //Check that email addrss input corresponds to the normal form of an email address
    if (!emailRegex.test(newEmail)) {
        return res.redirect('/error');
    };

    // Validate user's password and log the user in and save session cookie to the DB
    db.collection('users').findOne( { email: newEmail } )
        .then(findResult => {
            if (!findResult) {
                return res.redirect('/error');
            } else {
                bcryptjs.compare(newPassword, findResult.password)
                .then(compareResult => {
                    if (!compareResult) { 
                        return res.redirect('/error');
                    } else {
                        req.session.authenticated = true;
                        req.session.email = newEmail;
                        req.session.save((err) => {
                            if (err) {
                            console.log(err);
                            return res.redirect('/error');
                            };
                        });
                        return res.redirect('/products');
                    };
                })
                .catch((err) => {
                    console.log(err);
                    return res.redirect('/error');
                });
            }

        })
        .catch((err) => {
            console.log(err);
            return res.redirect('/error');
        });
};

function createUser(req, res, next) {
    const authenticated = req.session.authenticated;

    if (authenticated === true) {
        res.redirect('/login');
    } else {
        res.render('createUser.ejs', { pageTitle: 'Create New User', authenticated: authenticated });
    }
    
};

function postCreateUser(req, res, next) {
    const newEmail = req.body.email;
    const newPassword = req.body.password;
    const db = databaseController.getDb();
    const emailRegex = /\w+@\w+\.\w+/;

    // Validate that all form fields have defined values
    if (!(newEmail || newPassword)) {
        return res.redirect('/error');
    };

    //Check that email addrss input corresponds to the normal form of an email address
    if (!emailRegex.test(newEmail)) {
        return res.redirect('/error');
    };

    // Verify that a user with the same email address has does not already exist in the DB before creating the new user account in the DB
    db.collection('users').findOne({ email: newEmail })
        .then(findResult => {
            if (findResult) {
                return res.redirect('/error');
            } else {
                bcryptjs.hash(newPassword, 10)
                .then(hashedPassword => {
                    const newUser = new userModel.User(
                        newEmail,
                        hashedPassword,
                        []
                    );
                    db.collection('users').insertOne(newUser)
                        .then((insertResult) => {
                            res.redirect('/login');
                        })
                        .catch(err => {
                            console.log(err)
                        });
                })
                .catch(err => {
                    console.log(err);
                });
            };
        })
        .catch(err => {
            console.log(err);
        });
    };


function logout(req, res, next) {
    const authenticated = req.session.authenticated;

    if (authenticated === true) {
        req.session.destroy((err) => {
            res.redirect('/');
        });
    } else {
        res.redirect('/error');
    };
};

function removeItem(req, res, next) {
    const userId = req.body.userId;
    const productId = req.body.productId;
    const authenticated = req.session.authenticated;
    const db = databaseController.getDb();

    // Check that user has logged in before proceeding
    if (authenticated !== true) {
        return res.redirect('/login');
    }; 

    // Delete the item from the DB
    db.collection('users').updateOne( { _id: ObjectId(userId) }, 
    { $pull: { cart: { _id: ObjectId(productId) } } })
        .then(updateResult => {
            if (!updateResult) {
                return res.redirect('/error');
            };
            return res.redirect('/reviewOrder');
        }).catch(err => {
            console.log(err);
            return res.redirect('/error');
        }); 
};


function submitOrder(req, res, next) {
    const authenticated = req.session.authenticated;
    const userId = req.body.userId;
    const db = databaseController.getDb();
    const orderFilePath = path.join(__dirname, '..', 'orders', 'order.txt');
    let orderString;

    // Check that user has logged in before proceeding
    if (authenticated !== true) {
        return res.redirect('/login');
    }; 

    // Obtain the cart items from the DB and write it to a file
    db.collection('users').findOne( { _id: ObjectId(userId) } )
        .then(userResult => {
            orderString = JSON.stringify(userResult);
            fs.appendFile(orderFilePath, orderString, (err) => {
                if (err) {
                    console.log(err);
                    return res.redirect('/error');
                } else {
                    // Clear all existing cart data in the DB
                    db.collection('users').updateOne({ _id: ObjectId(userId) }, { $set: { cart: [] } })
                        .then((updateResult) => {
                            return res.render('orderConfirmation.ejs', { pageTitle: 'Order Confirmation', authenticated: authenticated});
                        }).catch((err) => {
                            console.log(err);
                            return res.redirect('/error');
                        });
                };
            });
        })
        .catch(err => {
            console.log(err);
            return res.redirect('/error');
        });
};



// Export functions
exports.index = index;
exports.products = products;
exports.cart = cart;
exports.reviewOrder = reviewOrder;
exports.login = login;
exports.postLogin = postLogin;
exports.createUser = createUser;
exports.postCreateUser = postCreateUser;
exports.logout = logout;
exports.removeItem = removeItem;
exports.submitOrder = submitOrder;