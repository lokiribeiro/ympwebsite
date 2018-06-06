import { Mongo } from 'meteor/mongo';

export const Comments = new Mongo.Collection('comments');

Comments.allow({
    insert(userId, comment) {
        return userId;
    },
    update(userId, comment, fields, modifier) {
        return userId && comment.owner === userId;
    },
    remove(userId, comment) {
        return userId && comment.owner === userId;
    }
});