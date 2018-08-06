import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';


export function sendEmail(toEmail, toName, messageBody, fromEmail, fromName) {
    var status = '';
    var secretKey = Meteor.settings.SENDGRID_API_KEY;
    console.info('secretKey', secretKey);
    var authorize = "Bearer " + secretKey;
    HTTP.call("POST", "https://api.sendgrid.com/v3/mail/send", {
        data: {
            "personalizations": [
                {
                    "to": [
                        {
                            "email": toEmail,
                            "name": toName
                        }
                    ],
                    "bcc": [
                        {
                            "email": fromEmail,
                            "name": fromName
                        }
                    ],
                    "subject": "YMP Project Quote Inquiry"
                }
            ],
            "from": {
                "email": "admin@ymp.com",
                "name": "YMP Portal"
            },
            "reply_to": {
                "email": fromEmail,
                "name": fromName
            },
            "subject": "YMP Project Quote Inquiry",
            "content": [
                {
                    "type": "text/html",
                    "value": messageBody
                }
            ]
        },
        headers: {
            "Authorization": authorize
        }
    }, function (error, response) {
        if (error) {
            status = error;
            console.info('error', error);
        } else {
            status = response;
            console.info('response', response);
        }
    });
    console.info('status', status);
    return status;

}


Meteor.methods({
    sendEmail
});