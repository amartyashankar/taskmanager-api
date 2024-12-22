module.exports = {
  // Resolve the list of notes for a user when requested
  tasks: async (user, args, { models }) => {
    return await models.Task.find({ author: user._id }).sort({ _id: -1 });
  },
  // Resolve the list of favorites for a user when requested
  favorites: async (user, args, { models }) => {
    return await models.Task.find({ favoritedBy: user._id }).sort({ _id: -1 });
  }
};
