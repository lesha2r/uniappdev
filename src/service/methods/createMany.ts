interface CreateRecordInput {
  data: Record<string, any>;
  user?: any;
}

interface CreateManyInput {
  data: Record<string, any>[];
  user?: any;
}

async function createRecord(this: any, input: CreateRecordInput): Promise<any> {
  const { data, user } = input;

  if (this.schema !== null) this.schema.validate(data);

  const instance = new this.Model().init(data);

  if ('beforeCreate' in instance && typeof instance.beforeCreate === 'function') {
    await instance.beforeCreate.call(this, input);
  }

  await instance.insert();

  if ('onCreated' in instance && typeof instance.onCreated === 'function') {
    await instance.onCreated.call(this, input);
  }

  return instance.data();
}

async function createManyMethod(this: any, input: CreateManyInput): Promise<any[]> {
  const { data, user } = input;

  const dataRe = data.map((el) => {
    const elRe = { ...el };
    if (!elRe.createdAt) elRe.createdAt = new Date();
    if (!elRe.updatedAt) elRe.updatedAt = new Date();
    return elRe;
  });

  const promises: Promise<any>[] = [];

  let i = 0;
  while (i < dataRe.length) {
    const rec = dataRe[i];
    promises.push(createRecord.call(this, { data: rec, user }));
    i++;
  }

  const results = await Promise.all(promises);
  return results;
}

export default createManyMethod;