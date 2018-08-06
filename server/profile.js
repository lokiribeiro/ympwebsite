import _ from 'underscore';
import { Profiles } from '../imports/api/profiles';

import { Meteor } from 'meteor/meteor';
  
export function  upsertProfilePhoto(profileID, downloadUrl){
  var selector = {_id: profileID};
  var modifier = {$set: {
      profilePhoto: downloadUrl
    }};
    if (Meteor.isServer) {
  var fileUpsert = Profiles.upsert(selector, modifier);
    }
  return fileUpsert;
}

export function upsertBoatIDProfile(userID, boatID, boatName){
  var selector = {_id: userID};
  var modifier = {$set: {
    boatID: boatID,
    boatName: boatName
  }};
  var roleUpsert = Profiles.upsert(selector, modifier);
  return roleUpsert;
}

export function upsertRemoveProfile(userID, setRemove){
  var selector = {_id: userID};
  var modifier = {$set: {
    setRemove: setRemove
  }};
  var roleUpsert = Profiles.upsert(selector, modifier);
  return roleUpsert;
}

export function upsertRemoveProfileConfirm(userID){
  var selector = {_id: userID};
  var boatID = '';
  var boatName = '';
  var removed = true;
  var modifier = {$set: {
    boatID: boatID,
    boatName: boatName,
    removed: removed
  }};
  var roleUpsert = Profiles.upsert(selector, modifier);
  return roleUpsert;
}

export function upsertOnboardProfile(userID, boatID, boatName){
  var selector = {_id: userID};
  var status = false;
  var modifier = {$set: {
    boatID: boatID,
    boatName: boatName,
    removed: status,
    setRemove: status
  }};
  var roleUpsert = Profiles.upsert(selector, modifier);
  return roleUpsert;
}
  

Meteor.methods({
    upsertProfilePhoto,
    upsertBoatIDProfile,
    upsertRemoveProfile,
    upsertRemoveProfileConfirm,
    upsertOnboardProfile
});