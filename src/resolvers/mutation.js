const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config();

const gravatar = require('../util/gravatar');

module.exports = {
  newTask: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note');
    }

    return await models.Task.create({
      title: args.title,
      description: args.description,
      status: args.status,
      author: mongoose.Types.ObjectId(user.id),
      favoriteCount: 0,
    });
  },
  deleteUser: async (parent, { id }, { models, user }) => {
    // If no user is logged in, throw an authentication error
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a user');
    }
  
    // Only allow admins to delete users (Uncomment this if needed)
    // if (user.username !== 'admin') {
    //   throw new ForbiddenError("You don't have permission to delete users");
    // }
  
    // Find the user to delete
    const userToDelete = await models.User.findById(id);
  
    // If the user doesn't exist, throw an error
    if (!userToDelete) {
      throw new Error('User not found');
    }
  
    try {
      // Delete all tasks related to the user
      await models.Task.deleteMany({ author: userToDelete._id });
  
      // Delete the user from the database
      await userToDelete.remove();
  
      return 'User and their tasks deleted successfully' ;
    } catch (err) {
      // If there was an error deleting the user and their tasks, throw an error
      throw new Error('Error deleting user and their tasks');
    }
  },
  
  
  deleteTask: async (parent, { id }, { models, user }) => {
    // if not a user, throw an Authentication Error
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }

    // find the note
    const task = await models.Task.findById(id);
    // if the note owner and current user don't match, throw a forbidden error
    if (String(task.author) !== String(user.id) && user.username !== 'admin') {
      throw new ForbiddenError("You don't have permissions to delete the note");
    }

    try {
      // if everything checks out, remove the note
      await task.remove();
      return true;
    } catch (err) {
      // if there's an error along the way, return false
      return false;
    }
  },
  updateTask: async (parent, { status, id }, { models, user }) => {
    // if not a user, throw an Authentication Error
    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note');
    }

    // find the note
    const task = await models.Task.findById(id);
    // if the note owner and current user don't match, throw a forbidden error
    if (String(task.author) !== String(user.id) && user.username !== 'admin') {
      throw new ForbiddenError("You don't have permissions to update the note");
    }

    // Update the note in the db and return the updated note
    return await models.Task.findOneAndUpdate(
      {
        _id: id
      },
      {
        $set: {
          status
        }
      },
      {
        new: true
      }
    );
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    // if no user context is passed, throw auth error
    if (!user) {
      throw new AuthenticationError();
    }

    // check to see if the user has already favorited the note
    let taskCheck = await models.Task.findById(id);
    const hasUser = taskCheck.favoritedBy.indexOf(user.id);

    // if the user exists in the list
    // pull them from the list and reduce the favoriteCount by 1
    if (hasUser >= 0) {
      return await models.Task.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        {
          // Set new to true to return the updated doc
          new: true
        }
      );
    } else {
      // if the user doesn't exists in the list
      // add them to the list and increment the favoriteCount by 1
      return await models.Task.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {
          new: true
        }
      );
    }
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    // normalize email address
    email = email.trim().toLowerCase();
    // hash the password
    const hashed = await bcrypt.hash(password, 10);
    // create the gravatar url
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      });

      // create and return the json web token
      return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    } catch (err) {
      // if there's a problem creating the account, throw an error
      console.error("Error in signUp mutation:", err);
      throw new Error('Error creating account');
    }
  },

  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      // normalize email address
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }]
    });

    // if no user is found, throw an authentication error
    if (!user) {
      throw new AuthenticationError('Error signing in');
    }

    // if the passwords don't match, throw an authentication error
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Error signing in');
    }

    // create and return the json web token
    return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
  }
};
