interface CreateInput {
  data: Record<string, any>;
  user?: any;
}

async function createMethod(this: any, input: CreateInput): Promise<any> {
  const { data, user } = input;

  const dataRe = {
    ...data,
  };

  delete dataRe._id;

  if (!dataRe.createdAt) dataRe.createdAt = new Date();
  if (!dataRe.updatedAt) dataRe.updatedAt = new Date();

  if (this.schema !== null) this.schema.validate(data);

  const instance = new this.Model().init(dataRe);

  if ('beforeCreate' in instance && typeof instance.beforeCreate === 'function') {
    await instance.beforeCreate.call(this, input);
  }

  await instance.insert();

  if ('onCreated' in instance && typeof instance.onCreated === 'function') {
    await instance.onCreated.call(this, input);
  }

  return instance.data();
}

export default createMethod;