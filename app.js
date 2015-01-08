require('./lib/setup')();

//todo: bind global exception

var app = {
    node_env: process.env.NODE_ENV || 'development',
    init: require('./lib/route'),
    config: require('./lib/config')
};

app.init(app.node_env, function (server) {
    var config = app.config({mode: app.node_env});

    server.listen(config.server.port, function serverStarted() {
        //console.log('%s listening at %s', server.name, server.url);
    });
});

module.exports = app;