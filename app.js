require('./core/setup')();

var app = {
    node_env: process.env.NODE_ENV || 'development',
    init: require('./core/route'),
    config: require('./core/config')
};

// todo: 데이터베이스 서버는 하나만, 고로 array 로 된 현재 세팅 값은 그냥 일반 스트링으로 변경해야 함.

app.init(app.node_env, function (server) {
    var mongoose = require('mongoose');

    var restify = require('restify');
    var bunyan = require('bunyan');

    var config = app.config({mode: app.node_env});

    // init mongoose
    mongoose.connect(config.database.mongo[0].host);
    mongoose.connection.on('error', function () {
        console.error('MongoDB Connection Error. Make sure MongoDB is running.');
    });

    // start application
    server.listen(config.server.port, function serverStarted() {
        console.log('%s listening at %s in %s mode', server.name, server.url, app.node_env);
    });

    // start request logger
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