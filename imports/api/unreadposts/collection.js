import { Mongo } from 'meteor/mongo';

export const Unreadposts = new Mongo.Collection('unreadposts');

Unreadposts.allow({
    insert(userId, unreadpost) {
        return userId;
    },
    update(userId, unreadpost, fields, modifier) {
        return true;
    },
    remove(userId, unreadpost) {
        return true;
    }
});