var restify = require('restify');
var server = restify.createServer();

function route(mode, callback) {
    console.log(mode);
    // load configuration for exist mode

    server.get('/testing', function (req, res) {
        res.json({msg: "hi"});
    });

    callback(server);
}

module.exports = route;