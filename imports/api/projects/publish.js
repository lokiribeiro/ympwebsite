import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { Projects } from './collection';

if (Meteor.isServer) {
    Meteor.publish('projects', function (options, searchString) {
        var selector = {};

        if (typeof searchString === 'string' && searchString.length) {
            var search = { $regex: `.*${searchString}.*`, $options: 'i' };
            selector = {
                $or: [
                    { name: search },
                    { projectCode: search },
                    { ownerName: search }
                ]
            };
        }

        Counts.publish(this, 'numberOfProjects', Projects.find(selector), {
            noReady: true
        });

        return Projects.find(selector, options);
    });

    Meteor.publish('otherprojects', function (options, searchString, owner) {
        var selector = { owner: { $ne: owner } };

        if (typeof searchString === 'string' && searchString.length) {
            var search = { $regex: `.*${searchString}.*`, $options: 'i' };
            selector = {
                $and: [
                    { owner: { $ne: owner } },
                    {
                        $or: [
                            { name: search },
                            { projectCode: search },
                            { ownerName: search }
                        ]
                    }
                ]
            };
        }

        Counts.publish(this, 'numberOfOtherProjects', Projects.find(selector), {
            noReady: true
        });

        return Projects.find(selector, options);
    });

    Meteor.publish('myprojects', function (options, searchString, owner) {
        var selector = { owner: owner };

        if (typeof searchString === 'string' && searchString.length) {
            var search = { $regex: `.*${searchString}.*`, $options: 'i' };
            selector = {
                $and: [
                    { owner: owner },
                    {
                        $or: [
                            { name: search },
                            { projectCode: search },
                            { ownerName: search }
                        ]
                    }
                ]
            };
        }

            Counts.publish(this, 'numberOfMyProjects', Projects.find(selector), {
                noReady: true
            });

            return Projects.find(selector, options);
        });
}