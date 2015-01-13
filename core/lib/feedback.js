var http = require('http');

var feedback = {};

feedback.init = function (result, statusCode, message) {
    result.isResult = true;
    result.statusCode = statusCode;
    result.meta = {
        error: http.STATUS_CODES[statusCode] || 'Unknown'
    };

    if (statusCode === 500) {
        result.meta.message = 'An internal server error occurred';
    } else if (result.message) {
        result.meta.message = result.message;
    }

    if (!message && !result.message) {
        message = result.meta.error;
    } else if (result.message) {
        message = result.message;
    }

    if (message) {
        result.message = (result.meta.error + (result.message ? ': ' + result.message : ''));
    }

    return result;
};

exports.wrap = function (result, statusCode, message) {
    return (result.isResult ? result : feedback.init(result, statusCode || 200, message));
};

exports.create = function (statusCode, message, data) {
    var result = {
        message: message || undefined,
        data: data || null
    };

    feedback.init(result, statusCode);

    return result;
};

exports.done = function (message, data) {
    return exports.create(200, message, data);
};

exports.badRequest = function (message, data) {
    return exports.create(400, message, data);
};

exports.unauthorized = function (message) {
    return exports.create(401, message);
};

exports.forbidden = function (message, data) {
    return exports.create(403, message, data);
};

exports.notFound = function (message, data) {
    return exports.create(404, message, data);
};

exports.methodNotAllowed = function (message, data) {
    return exports.create(405, message, data);
};

exports.notAcceptable = function (message, data) {
    return exports.create(406, message, data);
};

exports.proxyAuthRequired = function (message, data) {
    return exports.create(407, message, data);
};


exports.clientTimeout = function (message, data) {
    return exports.create(408, message, data);
};


exports.conflict = function (message, data) {
    return exports.create(409, message, data);
};


exports.resourceGone = function (message, data) {
    return exports.create(410, message, data);
};


exports.lengthRequired = function (message, data) {
    return exports.create(411, message, data);
};


exports.preconditionFailed = function (message, data) {
    return exports.create(412, message, data);
};


exports.entityTooLarge = function (message, data) {
    return exports.create(413, message, data);
};


exports.uriTooLong = function (message, data) {
    return exports.create(414, message, data);
};


exports.unsupportedMediaType = function (message, data) {
    return exports.create(415, message, data);
};


exports.rangeNotSatisfiable = function (message, data) {
    return exports.create(416, message, data);
};


exports.expectationFailed = function (message, data) {
    return exports.create(417, message, data);
};

exports.badData = function (message, data) {
    return exports.create(422, message, data);
};

exports.tooManyRequests = function (message, data) {
    return exports.create(429, message, data);
};

exports.internal = function (message, data, statusCode) {
    var error = (data instanceof Error ? exports.wrap(data, statusCode, message) : exports.create(statusCode || 500, message));

    if (data instanceof Error === false) {
        error.data = data;
    }

    return error;
};

exports.notImplemented = function (message, data) {
    return exports.internal(message, data, 501);
};

exports.badGateway = function (message, data) {
    return exports.internal(message, data, 502);
};

exports.serverTimeout = function (message, data) {
    return exports.internal(message, data, 503);
};

exports.gatewayTimeout = function (message, data) {
    return exports.internal(message, data, 504);
};

exports.badImplementation = function (message, data) {
    var error = exports.internal(message, data, 500);
    error.isDeveloperError = true;
    return error;
};