import _ from 'underscore';
import { Posts } from '../imports/api/posts';

import { Meteor } from 'meteor/meteor';
  
export function  upsertPost(postID, date, lastReplyName, lastReplyPhoto, totalPosts){
  var selector = {_id: postID};
  var modifier = {$set: {
      date: date,
      lastReplyName: lastReplyName,
      lastReplyPhoto: lastReplyPhoto,
      totalPosts: totalPosts
    }};
    if (Meteor.isServer) {
  var postUpsert = Posts.upsert(selector, modifier);
    }
  return postUpsert;
}

export function  updatePost(postID, details, subject){
  var selector = {_id: postID};
  var modifier = {$set: {
      details: details,
      subject: subject
    }};
    if (Meteor.isServer) {
  var postUpsert = Posts.upsert(selector, modifier);
    }
  return postUpsert;
}
  

Meteor.methods({
  upsertPost,
  updatePost
});