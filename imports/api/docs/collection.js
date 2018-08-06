import { Mongo } from 'meteor/mongo';

export const Docs = new Mongo.Collection('docs');

Docs.allow({
 insert(userId, doc) {
   return userId;
 },
 update(userId, doc, fields, modifier) {
   return true;
 },
 remove(userId, doc) {
   return true;
 }
});