"use strict";

var path = require('path');

var SERVICE_NAME = 'harookit';
var SERVICE_FOLDER = __dirname;

var server = function serverConfig(option) {
    var config = {
        'production': {
            port: 3032
        },
        'development': {
            port: 3032
        },
        'testing': {
            host: '127.0.0.1',
            port: 3032
        }
    };

    return config[option.mode];
};

var database = function databaseConfig(option) {
    var config = {
        'production': {
            client: 'file',
            dir: path.join(__dirname, '/content/data/'),
            file: {
                user: 'harookit-users',
                log: 'harookit-logs'
            }
        },
        'development': {
            client: 'file',
            dir: path.join(__dirname, '/content/data/'),
            file: {
                user: 'harookit-users',
                log: 'harookit-logs'
            }
        },
        'testing': {
            client: 'memory'
        }
    };

    return config[option.mode];
};

exports.get = function getConfiguration(option) {
    return {
        name: SERVICE_NAME,
        root: SERVICE_FOLDER,
        server: server(option),
        database: database(option)
    };
};
