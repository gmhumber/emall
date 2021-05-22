// Import the necessary modules
const databaseController = require('./databaseController');
const productModel = require('../models/productModel');
const ObjectId = require('mongodb').ObjectId;
const bcryptjs = require('bcryptjs');


function cmsLogin(req, res, next) {
    const authenticated = req.session.authenticated;
    res.render('cmsLogin.ejs', { pageTitle: 'CMS Portal Login', authenticated: authenticated });
};


function postCmsLogin(req, res, next) {
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

    // Validate admin user's password and privilages and log the user in and save session cookie to the DB
    db.collection('users').findOne( { email: newEmail } )
        .then(findResult => {
            if (!findResult || findResult.privilages !== 'admin') {
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
                        return res.redirect('/cmsProducts');
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


function cmsProducts(req, res, next) {
    const authenticated = req.session.authenticated;
    const userEmail = req.session.email;
    const db = databaseController.getDb();
    
    
    // Check that user has logged in before proceeding
    if (authenticated !== true) {
        return res.redirect('/cmsLogin');
    };

    // Check that user has admin privilages and render the view
    db.collection('users').findOne( { email: userEmail } )
        .then(findResult => {
            if (!findResult || findResult.privilages !== 'admin') {
                return res.redirect('/error');
            } else {
                db.collection('products').find().toArray()
                    .then(results => {
                        res.render('cmsProducts.ejs', { 
                            productsArray: results, 
                            pageTitle: 'CMS Portal: Products',
                            authenticated: authenticated });
                    })
                    .catch(err => {
                        console.log(err);
                        return res.redirect('/error');
                    });                
            };
        }).catch(err => {
            console.log(err);
            return res.redirect('/error');
        });;
};


function cmsProductAdd(req, res, next) {
    const authenticated = req.session.authenticated;
    const userEmail = req.session.email;
    const db = databaseController.getDb();
    const newName = req.body.addName;
    const newDescription = req.body.addDescription;
    const newPrice = parseFloat(req.body.addPrice).toFixed(2);
    const newSku = req.body.addSku;
    const newProduct = new productModel.Product (
        newName,
        newDescription,
        newPrice,
        newSku
    );

    // Check that user has logged in before proceeding
    if (authenticated !== true) {
        return res.redirect('/cmsLogin');
    };

    // Check that user has admin privilages and add new product to DB
    db.collection('users').findOne( { email: userEmail } )
        .then(findResult => {
            if (!findResult || findResult.privilages !== 'admin') {
                return res.redirect('/error');
            } else {
                db.collection('products').insertOne(newProduct)
                    .then(results => {
                        if (!results) {
                            res.redirect('/error');
                        } else {
                            res.redirect('/cmsProducts')
                        };
                    })
                    .catch(err => {
                        console.log(err);
                        return res.redirect('/error');
                    });                
            };
        }).catch(err => {
            console.log(err);
            return res.redirect('/error');
        });;
    };


    function cmsProductDelete(req, res, next) {
        const authenticated = req.session.authenticated;
        const userEmail = req.session.email;
        const db = databaseController.getDb();
        const productId = req.body.productId;
    
        // Check that user has logged in before proceeding
        if (authenticated !== true) {
            return res.redirect('/cmsLogin');
        };
    
        // Check that user has admin privilages and add new product to DB
        db.collection('users').findOne( { email: userEmail } )
            .then(findResult => {
                if (!findResult || findResult.privilages !== 'admin') {
                    return res.redirect('/error');
                } else {
                    db.collection('products').deleteOne({ _id: ObjectId(productId) })
                        .then(results => {
                            if (!results) {
                                res.redirect('/error');
                            } else {
                                res.redirect('/cmsProducts')
                            };
                        })
                        .catch(err => {
                            console.log(err);
                            return res.redirect('/error');
                        });                
                };
            }).catch(err => {
                console.log(err);
                return res.redirect('/error');
            });;
        };


function cmsProductChange(req, res, next) {
    const authenticated = req.session.authenticated;
    const userEmail = req.session.email;
    const db = databaseController.getDb();
    const originalProductId = req.body.originalProductId;
    const newName = req.body.newName;
    const newDescription = req.body.newDescription;
    const newPrice = parseFloat(req.body.newPrice).toFixed(2);
    const newSku = req.body.newSku;

    // Check that user has logged in before proceeding
    if (authenticated !== true) {
        return res.redirect('/cmsLogin');
    };

    // Check that user has admin privilages and add new product to DB
    db.collection('users').findOne( { email: userEmail } )
        .then(findResult => {
            if (!findResult || findResult.privilages !== 'admin') {
                return res.redirect('/error');
            } else {
                db.collection('products').updateOne( {_id: ObjectId(originalProductId) }, { $set: { name: newName, 
                    description: newDescription, 
                    price: newPrice, 
                    sku: newSku } })
                .then(results => {
                    if (!results) {
                        res.redirect('/error');
                    } else {
                        res.redirect('/cmsProducts')
                    };
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


// Export functions
exports.cmsLogin = cmsLogin;
exports.postCmsLogin = postCmsLogin;
exports.cmsProducts = cmsProducts;
exports.cmsProductAdd = cmsProductAdd;
exports.cmsProductDelete = cmsProductDelete;
exports.cmsProductChange = cmsProductChange;
