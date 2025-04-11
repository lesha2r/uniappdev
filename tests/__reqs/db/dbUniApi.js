import mongomod from 'mongomod';
import env from '../../env.js';

const testDb = new mongomod.Connection({
  link: env.mongoLink,
  login: env.mongoUser,
  password: env.mongoPassword,
  dbName: '__uniapi-test__',
  debug: true,
  srv: env.mongoSvr,
});

await testDb.connect();

const users = new mongomod.Controller(testDb, 'users');
const posts = new mongomod.Controller(testDb, 'posts');
const comments = new mongomod.Controller(testDb, 'comments');
const likes = new mongomod.Controller(testDb, 'likes');

export default {
  db: testDb,
  collections: {
    users,
    posts,
    comments,
    likes,
  },
};
