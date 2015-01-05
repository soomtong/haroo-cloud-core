var app = {
    port: 3031,
    mode: process.env.NODE_ENV || 'development',
    route: require('./lib/route')
};

app.route(app.mode, function (server) {
    server.listen(app.port, function serverStarted() {
        console.log('%s listening at %s', server.name, server.url);
    });
});

module.exports = app;