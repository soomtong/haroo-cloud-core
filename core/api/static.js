exports.home = function (req, res, next) {
    // some static html page for api.haroocloud.com
    // just for only introduce
    res.send('<h1>Index of Api service</h1>');

    return next();
};