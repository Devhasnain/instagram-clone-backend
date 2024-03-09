const userPostsPopulation = {
  path: "posts",
  populate: {
    path: "comments",
    select: "_id user text replies likes createdAt",
    populate: [
      {
        path: "likes",
        select: "_id username name image",
      },
      {
        path: "user",
        select: "_id username name image",
      },
      {
        path: "replies",
        select: "_id user text likes createdAt",
        populate: [
          {
            path: "user",
            select: "_id username name image",
          },
          {
            path: "likes",
            select: "_id username name image",
          },
        ],
      },
    ],
  },
};

const userPostLikePopulation = {
  path: "posts",
  populate: {
    path: "likes",
    select: "_id username name image",
  },
};

const userStoryPopulation = {
  path: "stories",
  select: "_id assets likes views createdAt",
  populate: [
    {
      path: "likes",
      select: "_id username name image",
    },
    {
      path: "views",
      select: "_id username name image",
    },
  ],
};



const populateLikes = {
  path: "likes",
  select: "_id username name image",
};
const populateReplies = {
  path: "replies",
  select: "_id user text likes createdAt",
  populate: [
    {
      path: "user",
      select: "_id username name image",
    },
    {
      path: "likes",
      select: "_id username name image",
    },
  ],
};
const populateUser = {
  path: "user",
  select: "_id username name image",
};

const populateComments = {
  path: "comments",
  select: "_id user text replies likes createdAt",
  populate: [populateUser, populateLikes, populateReplies],
};

module.exports = {
  userPostsPopulation,
  userPostLikePopulation,
  userStoryPopulation,
  populateComments,
  populateLikes,
  populateUser
};
