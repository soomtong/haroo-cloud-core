// copy config.json file if not exist that
function copyConfiguration(src, dst, callback) {
    var fs = require('fs');
    var is, os;

    fs.stat(dst, function (err, stat) {
        if (err) {
            fs.stat(src, function (err, stat) {
                if (err) {
                    console.error('configuration file not exist');
                    return callback(err);
                }

                is = fs.createReadStream(src);
                os = fs.createWriteStream(dst);

                is.pipe(os);
                os.on('close', function (err) {
                    if (err) {
                        console.error('configuration file copy job is failed');

                        return callback(err);
                    }
                    console.log('=== configuration file copied, just update your `config.js` ===');
                });
            });
        } else {
            return callback()
        }
    });
}

function init() {
    copyConfiguration('config-sample.json', 'config.json', function (err) {
        // after copy and check params that is real one
        if (err) {
            console.error('configuration file manipulation is failed');

            return;
        }

        var config = require('../config');

        if (!config.app['production']) {
            throw Error('configuration file corrupted');
        }
        if (!config['web_server']['development']) {
            throw Error('configuration file corrupted');
        }
        if (!config.database['production']) {
            throw Error('configuration file corrupted');
        }
        if (!config.database['development']) {
            throw Error('configuration file corrupted');
        }
    });
}

if (require.main === module) {
    init();
}

module.exports = init;