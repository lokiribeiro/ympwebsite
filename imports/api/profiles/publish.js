import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Profiles } from './collection';

if (Meteor.isServer) {
  Meteor.publish('profiles', function (options, searchString) {
    var selector = {};

    if (typeof searchString === 'string' && searchString.length) {
      var search = { $regex: `.*${searchString}.*`, $options: 'i' };
      selector = {
        $or: [
          { firstName: search },
          { lastName: search },
          { type: search },
          { status: search },
          { termOfEmployment: search },
          { username: search }
        ]
      };
    }

    Counts.publish(this, 'numberOfProfiles', Profiles.find(selector), {
      noReady: true
    });

    return Profiles.find(selector, options);
  });

  Meteor.publish('profilesList', function (options, searchString) {
    var selector = { removed: true };

    if (typeof searchString === 'string' && searchString.length) {
      var search = { $regex: `.*${searchString}.*`, $options: 'i' };
      selector = {
        $and: [
          { removed: true },
          {
            $or: [
              { firstName: search },
              { lastName: search },
              { type: search },
              { status: search },
              { termOfEmployment: search },
              { username: search }
            ]
          }
        ]
      };
    }

    Counts.publish(this, 'numberOfProfilesList', Profiles.find(selector), {
      noReady: true
    });

    return Profiles.find(selector, options);
  });
}