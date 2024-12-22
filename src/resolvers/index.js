const Query = require('./query');
const Mutation = require('./mutation');
const Task = require('./task');
const User = require('./user');
const { GraphQLDateTime } = require('graphql-iso-date');

module.exports = {
  Query,
  Mutation,
  Task,
  User,
  DateTime: GraphQLDateTime
};
