// Controller functions to render error pages

function pageNotFound(req, res, next) {
    res.status(404);
    res.render('pageNotFound.ejs', {pageTitle: 'Page Not Found' });
};

function pageError(req, res, next) {
    res.status(500);
    res.render('pageError.ejs', {pageTitle: 'Error' });
};

// Export functions
exports.pageNotFound = pageNotFound;
exports.pageError = pageError;
