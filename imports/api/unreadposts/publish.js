import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Unreadposts } from './collection';

if (Meteor.isServer) {
    Meteor.publish('unreadposts', function() {
        var selector = {};

        Counts.publish(this, 'numberOfUnreadPosts', Unreadposts.find(selector), {
            noReady: true
          });
     
        return Unreadposts.find(selector);
      });
}