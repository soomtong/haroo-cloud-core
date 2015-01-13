


exports.getHostIp = function (host) {
    // ref. Express, https://github.com/strongloop/express/blob/master/lib/request.js#L380
    // IPv6 literal support
    var offset = host[0] === '['
        ? host.indexOf(']') + 1
        : 0;
    var index = host.indexOf(':', offset);

    return ~index
        ? host.substring(0, index)
        : host;
};