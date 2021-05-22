// Controller functions to render error pages

function pageNotFound(req, res, next) {
    const authenticated = req.session.authenticated;
    res.status(404);
    res.render('pageNotFound.ejs', { pageTitle: 'Page Not Found', authenticated: authenticated });
};

function pageError(req, res, next) {
    const authenticated = req.session.authenticated;
    res.status(500);
    res.render('pageError.ejs', { pageTitle: 'Error', authenticated: authenticated });
};

// Export functions
exports.pageNotFound = pageNotFound;
exports.pageError = pageError;
