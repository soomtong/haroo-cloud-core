var nodemailer = require('nodemailer');
var emailTemplates = require('swig-email-templates');

exports.sendPasswordResetMailByDelegate = function (address, context, emailToken, callback) {
    var smtpTransport = nodemailer.createTransport(emailToken);

    emailTemplates({root: __dirname + "/templates"}, function (error, render) {
        var email = {
            from: emailToken['reply'], // sender address
            to: address,
//            bcc: emailToken.bcc,
            subject: "Reset your password link described from haroo-cloud"
        };

        render('password_reset_email.html', context, function (error, html) {
            email.html = html;

            smtpTransport.sendMail(email, function (error, info) {
                if (error) {
                    callback && callback(error);
                } else {
                    callback && callback(info);
                }

                // if you don't want to use this transport object anymore, uncomment following line
                smtpTransport.close(); // shut down the connection pool, no more messages
            });
        });
    });
};
