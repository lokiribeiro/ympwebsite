import _ from 'underscore';
import { Unreadposts } from '../imports/api/unreadposts';

import { Meteor } from 'meteor/meteor';

export function upsertUnread(unreadID, unread) {
    var selector = { _id: unreadID };
    var modifier = {
        $set: {
            unread: unread
        }
    };
    if (Meteor.isServer) {
        var postUpsert = Unreadposts.upsert(selector, modifier);
    }
    return postUpsert;
}


Meteor.methods({
    upsertUnread
});