module.exports = {
  task: async (parent, args, { models }) => {
    return await models.Task.find().limit(100);
  },
  task: async (parent, args, { models }) => {
    return await models.Task.findById(args.id);
  },
  user: async (parent, args, { models }) => {
    return await models.User.findOne({ username: args.username });
  },
  users: async (parent, args, { models }) => {
    return await models.User.find({}).limit(100);
  },
  userById: async (parent, args, { models }) => {
    return await models.User.findById(args.id);
  },
  me: async (parent, args, { models, user }) => {
    return await models.User.findById(user.id);
  },
  taskFeed: async (parent, { cursor }, { models }) => {
    // hard code the limit to 10 items
    const limit = 10;
    // set the default hasNextPage value to false
    let hasNextPage = false;
    // if no cursor is passed the default query will be empty
    // this will pull the newest notes from the db
    let cursorQuery = {};

    // if there is a cursor
    // our query will look for notes with an ObjectId less than that of the cursor
    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }

    // find the limit + 1 of notes in our db, sorted newest to oldest
    let tasks = await models.Task.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(limit + 1);

    // if the number of notes we find exceeds our limit
    // set hasNextPage to true & trim the notes to the limit
    if (tasks.length > limit) {
      hasNextPage = true;
      tasks = tasks.slice(0, -1);
    }

    // the new cursor will be the Mongo ObjectID of the last item in the feed array
    const newCursor = tasks[tasks.length - 1]._id;

    return {
      tasks,
      cursor: newCursor,
      hasNextPage
    };
  }
};
