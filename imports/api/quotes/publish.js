import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Quotes } from './collection';

if (Meteor.isServer) {
    Meteor.publish('quotes', function(options, searchString) {
        var selector = {};

        Counts.publish(this, 'numberOfQuotes', Quotes.find(selector), {
            noReady: true
          });
     
        return Quotes.find(selector, options);
      });
}