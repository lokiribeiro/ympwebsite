import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Projectjobs } from './collection';

if (Meteor.isServer) {
    Meteor.publish('projectjobs', function(options, searchString) {
        var selector = {};

        Counts.publish(this, 'numberOfProjectjobs', Projectjobs.find(selector), {
            noReady: true
          });
     
        return Projectjobs.find(selector, options);
      });
}