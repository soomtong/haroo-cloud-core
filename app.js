require('./lib/setup')();

var app = {
    node_env: process.env.NODE_ENV || 'development',
    init: require('./lib/route'),
    config: require('./lib/config')
};

app.init(app.node_env, function (server) {
    var restify = require('restify');
    var bunyan = require('bunyan');

    var config = app.config({mode: app.node_env});

    server.listen(config.server.port, function serverStarted() {
        //console.log('%s listening at %s', server.name, server.url);
    });

    server.on('after', restify.auditLogger({
        log: bunyan.createLogger({
            name: 'haroo-api',
            streams: [
                {level: 'info', path: 'log/info.log'},
                {level: 'error', path: 'log/error.log'}
            ]
        })
    }));

    //todo: bind global exception

});

module.exports = app;