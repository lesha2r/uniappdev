/* eslint-disable require-jsdoc */
// @ts-nocheck
// @ts-ignore
class MockRes {
  // eslint-disable-next-line require-jsdoc
  constructor() {
    this.statusCode = 200;
    this.response = null;
  }

  // eslint-disable-next-line require-jsdoc
  status(code) {
    this.statusCode = code;
    return this;
  }

  // eslint-disable-next-line require-jsdoc
  json(data) {
    const output = {
      mocked: true,
      code: this.statusCode,
      data: data,
    };

    this.response = data;

    return output;
  }
}


/* eslint-disable require-jsdoc */
export class MockReqResNext {
  // eslint-disable-next-line require-jsdoc
  constructor({body, query = {}, user = {}}) {
    this.req = {
      body,
      query,
      user,
    };

    this.res = new MockRes();

    this.next = () => {
      return 'next';
    };
  }
}

const mocka = new MockReqResNext({
  body: {name: 'Bob'},
  query: {page: 1},
  user: {_id: '123', workspace: '456'},
});

const test = async () => {
  const {req, res, next} = mocka;
  const result = res.status(201).json({name: 'Bob'});
  return result;
};

const result = await test();

export const getMock = async (obj) => {
  return new MockReqResNext(obj);
};

export default {
  MockReqResNext,
};
