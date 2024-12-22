const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar DateTime

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    author: User!
    favoriteCount: Int!
    favoritedBy: [User]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    tasks: [Task!]!
    favorites: [Task!]!
  }

  type TaskFeed {
    tasks: [Task]!
    cursor: String!
    hasNextPage: Boolean!
  }

  type Query {
    tasks: [Task!]!
    task(id: ID): Task!
    user(username: String!): User
    users: [User!]!
    userById(id: ID!): User!
    me: User!
    taskFeed(cursor: String): TaskFeed
  }

  type Mutation {
    newTask(title: String!, description: String, status: String!): Task
    updateTask(id: ID!, status: String!): Task!
    deleteTask(id: ID!): Boolean!
    toggleFavorite(id: ID!): Task!
    signUp(username: String!, email: String!, password: String!): String!
    signIn(username: String, email: String, password: String!): String!
    deleteUser(id: ID!): String!
  }

`;
