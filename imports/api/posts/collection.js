import { Mongo } from 'meteor/mongo';

export const Posts = new Mongo.Collection('posts');

Posts.allow({
 insert(userId, post) {
   return userId;
 },
 update(userId, post, fields, modifier) {
  return userId && post.owner === userId;
 },
 remove(userId, post) {
  return userId && post.owner === userId;
 }
});