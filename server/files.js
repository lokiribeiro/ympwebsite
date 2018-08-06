import { Meteor } from 'meteor/meteor';

Slingshot.GoogleCloud.directiveDefault.GoogleAccessId = "ymp-397@squalaschools-1491907969245.iam.gserviceaccount.com";
Slingshot.GoogleCloud.directiveDefault.GoogleSecretKey = Assets.getText('google-cloud-service-key.pem');

//Slingshot.createDirective('myFileUploads', Slingshot.GoogleCloud, {
Slingshot.createDirective('myFileUploads', Slingshot.S3Storage, {
    bucket: 'ympbucket',
    acl: 'public-read',
    allowedFileTypes: null,
    maxSize: null, // 10 MB (use null for unlimited).
    authorize: function() {
        if (!this.userId) {
            var message = 'Please login before posting file';
            throw new Meteor.Error('Login Required', message);
        }

        return true;
    },
    key: function(file) {
        var user = Meteor.user();
        var ext = file.type.split('/')[1];
        return user.username + '/' + Random.hexString(8) + '.' + ext;
    }
});
