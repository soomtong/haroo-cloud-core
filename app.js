require('./core/setup')();

var app = {
    node_env: process.env.NODE_ENV || 'development',
    init: require('./core/route'),
    config: require('./core/config')
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
            streams: [{
                level: 'info',
                path: 'logs/info.log',
                type: 'rotating-file',
                period: '1d'
            }, {
                level: 'error',
                path: 'logs/error.log',
                type: 'rotating-file',
                period: '1d'
            }]
        })
    }));

    //todo: bind global exception

});

module.exports = app;