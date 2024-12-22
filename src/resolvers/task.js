module.exports = {
  // Resolve the author info for a note when requested
  author: async (task, args, { models }) => {
    return await models.User.findById(task.author);
  },
  // Resolved the favoritedBy info for a note when requested
  favoritedBy: async (task, args, { models }) => {
    return await models.User.find({ _id: { $in: task.favoritedBy } });
  }
};
 