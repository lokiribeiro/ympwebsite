import { Mongo } from 'meteor/mongo';

export const Projectjobs = new Mongo.Collection('projectjobs');

Projectjobs.allow({
 insert(userId, projectjob) {
   return userId;
 },
 update(userId, projectjob, fields, modifier) {
  return userId && projectjob.owner === userId;
 },
 remove(userId, projectjob) {
  return userId && projectjob.owner === userId;
 }
});