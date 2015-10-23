var nodemailer = require('nodemailer');

exports.sendPasswordResetMailByDelegate = function (address, context, emailToken, callback) {
    var transporter = nodemailer.createTransport(emailToken);

    var email = {
        from: emailToken['reply'], // sender address
        to: address,
        //bcc: emailToken.bcc,
        subject: "Reset your password link described from haroo-cloud",
        html: "<h1>Haroo Cloud</h1><h2>Hi, Change your password from here link</h2><p><a href="
        + context.link + " target=\"_blank\">Reset Your Password for Haroonote</a></p>"
    };

    transporter.sendMail(email, function (error, info) {
        if (error) {
            callback && callback(error);
        } else {
            callback && callback(info);
        }

        transporter.close();
    });


    /*
     template({root: __dirname + "/templates"}, function (error, render) {
     var email = {
     from: emailToken['reply'], // sender address
     to: address,
     //            bcc: emailToken.bcc,
     subject: "Reset your password link described from haroo-cloud"
     };

     render('password_reset_email.html', context, function (error, html) {
     email.html = html;

     });
     });*/
};