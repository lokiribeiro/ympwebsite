import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Posts } from './collection';

if (Meteor.isServer) {
    Meteor.publish('posts', function(options, searchString, jobtitle) {
        var selector = {jobtitle: jobtitle};

        if (typeof searchString === 'string' && searchString.length) {
            var search = {$regex: `.*${searchString}.*`, $options: 'i'};
            selector = {$and: [
                {jobtitle: jobtitle},
                {$or: [
                    {subject: search},
                    {name: search}
                ]}
            ]};
        }

        Counts.publish(this, 'numberOfPosts', Posts.find(selector), {
            noReady: true
          });
     
        return Posts.find(selector, options);
      });

      Meteor.publish('individualpost', function() {
        var selector = {};
        return Posts.find(selector);
      });
}