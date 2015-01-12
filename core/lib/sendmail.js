var nodemailer = require('nodemailer');
var emailTemplates = require('swig-email-templates');

exports.sendPasswordResetMailByDelegate = function (address, context, emailToken) {
    var smtpTransport = nodemailer.createTransport(emailToken);

    emailTemplates({root: __dirname + "/templates"}, function (error, render) {
        var email = {
            from: emailToken['reply'], // sender address
            to: address,
//            bcc: emailToken.bcc,
            subject: "Reset your password link described from haroo-cloud"
        };

        render('password_reset_email.html', context, function (error, html) {
            console.log(html);
            email.html = html;
            smtpTransport.sendMail(email, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Message sent: " + info.response);
                }

                // if you don't want to use this transport object anymore, uncomment following line
                smtpTransport.close(); // shut down the connection pool, no more messages
            });
        });
    });
};