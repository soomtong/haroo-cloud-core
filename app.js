"use strict";

var mode = process.env.NODE_ENV || 'development';

var config = require('./config').get({mode: mode});
var harookit = require('./lib');

harookit.initialize.check();

// todo: cluster mode and singleton server instance
harookit.initDatabase(config, function (database) {
    var server = harookit.createServer(config, database);

    server.listen(config.server.port, function() {
        console.log('%s listening at %s', server.name, server.url);
    });
});