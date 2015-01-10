var SERVICE_NAME = 'haroo-cloud-core';
var SERVICE_FOLDER = '../';

var app = function appConfig(option) {
    var config = require('../config')['app'];

    return config[option.mode];
};

var server = function serverConfig(option) {
    var config = require('../config')['server'];

    return config[option.mode];
};

var database = function databaseConfig(option) {
    var config = require('../config')['database'];

    return config[option.mode];
};

module.exports = function getConfiguration(option) {
    return {
        name: SERVICE_NAME,
        root: SERVICE_FOLDER,
        app: app(option),
        server: server(option),
        database: database(option)
    };
};