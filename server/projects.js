import _ from 'underscore';
import { Projects } from '../imports/api/projects';

import { Meteor } from 'meteor/meteor';
  
export function  upsertProjectCode(projectID, projectCode){
  var selector = {_id: projectID};
  var modifier = {$set: {
      projectCode: projectCode
    }};
    if (Meteor.isServer) {
  var postUpsert = Projects.upsert(selector, modifier);
    }
  return postUpsert;
}

export function  updateProject(projectID, name, details){
    var selector = {_id: projectID};
    var modifier = {$set: {
        name: name,
        details: details
      }};
      if (Meteor.isServer) {
    var postUpsert = Projects.upsert(selector, modifier);
      }
    return postUpsert;
  }

  export function upsertProjectFile(projectID, filecount) {
    var selector = { _id: projectID };
    var modifier = {
        $set: {
            filecount: filecount
        }
    };
    if (Meteor.isServer) {
        var postUpsert = Projects.upsert(selector, modifier);
    }
    return postUpsert;
}

export function upsertProjectJob(projectID, jobcount) {
    var selector = { _id: projectID };
    var modifier = {
        $set: {
            jobcount: jobcount
        }
    };
    if (Meteor.isServer) {
        var postUpsert = Projects.upsert(selector, modifier);
    }
    return postUpsert;
}

export function upsertProjectImage(projectID, imagecount) {
    var selector = { _id: projectID };
    var modifier = {
        $set: {
            imagecount: imagecount
        }
    };
    if (Meteor.isServer) {
        var postUpsert = Projects.upsert(selector, modifier);
    }
    return postUpsert;
}

export function upsertProjectQuote(projectID, quotecount) {
    var selector = { _id: projectID };
    var modifier = {
        $set: {
            quotecount: quotecount
        }
    };
    if (Meteor.isServer) {
        var postUpsert = Projects.upsert(selector, modifier);
    }
    return postUpsert;
}

Meteor.methods({
    upsertProjectCode,
    updateProject,
    upsertProjectFile,
    upsertProjectJob,
    upsertProjectImage,
    upsertProjectQuote
});