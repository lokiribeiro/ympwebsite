import _ from 'underscore';
import { Comments } from '../imports/api/comments';

import { Meteor } from 'meteor/meteor';

export function updateComment(commentID, reply) {
    var selector = { _id: commentID };
    var modifier = {
        $set: {
            reply: reply
        }
    };
    if (Meteor.isServer) {
        var postUpsert = Comments.upsert(selector, modifier);
    }
    return postUpsert;
}


Meteor.methods({
    updateComment
});