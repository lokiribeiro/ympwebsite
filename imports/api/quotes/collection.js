import { Mongo } from 'meteor/mongo';

export const Quotes = new Mongo.Collection('quotes');

Quotes.allow({
 insert(userId, quote) {
   return userId;
 },
 update(userId, quote, fields, modifier) {
  return userId && quote.owner === userId;
 },
 remove(userId, quote) {
  return userId && quote.owner === userId;
 }
});