import { Meteor } from 'meteor/meteor';

import { Docs } from './collection';

if (Meteor.isServer) {
   Meteor.publish('docs', function() {
   var selector = {};

   return Docs.find(selector);
 });
}