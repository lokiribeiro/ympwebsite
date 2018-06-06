import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Comments } from './collection';

if (Meteor.isServer) {
    Meteor.publish('comments', function(options, searchString) {
        var selector = {};

        if (typeof searchString === 'string' && searchString.length) {
            var search = {$regex: `.*${searchString}.*`, $options: 'i'};
            selector = {$or: [
                {reply: search},
                {name: search}
            ]};
        }

        Counts.publish(this, 'numberOfComments', Comments.find(selector), {
            noReady: true
          });
     
        return Comments.find(selector, options);
      });
}