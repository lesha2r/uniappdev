import {expect, describe, test} from '@jest/globals';
import {ObjectId} from 'mongodb';
import userService from './services/userService.js';
import {MockReqResNext} from './__mocks/mockReqResNext.js';
import {__testUserModel} from './__reqs/models/User.js';
import fakeUsers from './__reqs/fakes/fakeUsers.js';
import db from './__reqs/db/dbUniApi.js';

// eslint-disable-next-line no-undef
global.ApiError = class ApiError extends Error {
  // eslint-disable-next-line require-jsdoc
  constructor(code = 200, message, options) {
    super(message, options);

    this.code = code;
  }
};

const create = async (req, res) => await userService.controller.create(req, res);

describe('userService.create', () => {
  const usersDb = db.collections.users;
  test('user collection is clear', async () => {
    await usersDb.deleteMany({query: {}});
    const users = await usersDb.findMany({query: {}});
    expect(users.result.length).toBe(0);
  });

  test('bad data', async () => {
    const user = fakeUsers.getRandom();

    const reqData = {
      body: {name: user.name},
      query: {page: 1},
      user: {_id: '67e2ec26e3ca112d851ff551', ws: '67e2ec26e3ca112d851ff552'},
    };

    const mocka = new MockReqResNext(reqData);

    const {req, res} = mocka;
    await create(req, res);

    expect(res.statusCode).toBe(400);
    expect(mocka.res.response.ok).toBe(false);

    __testUserModel.requiredKeys.forEach((key) => {
      if (key in reqData.body === true) {
        expect(mocka.res.response.error).not.toContain(key);
      } else {
        expect(mocka.res.response.error).toContain(key);
      }
    });
  });

  test('OK data', async () => {
    const userData = fakeUsers.getRandom();

    const mocka = new MockReqResNext({
      body: {
        ...userData,
      },
      user: {_id: '67e2ec26e3ca112d851ff551', ws: '67e2ec26e3ca112d851ff552'},
    });

    const {req, res} = mocka;
    await create(req, res);

    expect(res.statusCode).toBe(200);
    expect(mocka.res.response.ok).toBe(true);
    expect(mocka.res.response.result).toEqual({
      ...userData,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      _id: expect.any(ObjectId),
      workspace: expect.any(ObjectId),
    });
  });
});
