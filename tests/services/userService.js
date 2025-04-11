import {ObjectId} from 'mongodb';
import UniApi from '../../dist/_UniApi/UniApi.js';
import dbTest from '../__reqs/db/dbUniApi.js';
import User, {userSchema} from '../__reqs/models/User.js';

const userService = new UniApi({
  name: 'utest-users',
  model: User,
  db: dbTest.collections.users,
  schema: userSchema,
  serviceSettings: {
    userRequired: true,
    workspaceRequired: true,
  },
  methods: {
    create: {
      isActive: true,
      bodyCb: (body) => {
        return {
          ...body,
          workspace: new ObjectId(),
          _id: new ObjectId(),
        };
      },
    },
  },
});

export default userService;
