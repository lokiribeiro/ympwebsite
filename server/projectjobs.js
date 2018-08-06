import _ from 'underscore';
import { Projectjobs } from '../imports/api/projectjobs';

import { Meteor } from 'meteor/meteor';

export function upsertTotalFile(projectjobID, filecount) {
    var selector = { _id: projectjobID };
    var modifier = {
        $set: {
            filecount: filecount
        }
    };
    if (Meteor.isServer) {
        var postUpsert = Projectjobs.upsert(selector, modifier);
    }
    return postUpsert;
}

export function upsertTotalImage(projectjobID, filecount) {
    var selector = { _id: projectjobID };
    var modifier = {
        $set: {
            imagecount: filecount
        }
    };
    if (Meteor.isServer) {
        var postUpsert = Projectjobs.upsert(selector, modifier);
    }
    return postUpsert;
}

export function  updateProjectJob(projectjobID, name, description){
    var selector = {_id: projectjobID};
    var modifier = {$set: {
        name: name,
        description: description
      }};
      if (Meteor.isServer) {
    var postUpsert = Projectjobs.upsert(selector, modifier);
      }
    return postUpsert;
  }

Meteor.methods({
    upsertTotalFile,
    upsertTotalImage,
    updateProjectJob
});