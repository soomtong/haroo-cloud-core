var util = require('util');
var restify = require('restify');
var server = restify.createServer();

function route(mode, callback) {
    util.error(mode);
    // load configuration for exist mode

    server.get('/testing', function (req, res) {
        res.json({msg: "hi"});
    });

    callback(server);
}

module.exports = route;