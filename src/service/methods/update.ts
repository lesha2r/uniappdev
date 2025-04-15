interface UpdateInput {
  query: Record<string, any>;
  data: Record<string, any>;
}

async function updateMethod(this: any, input: UpdateInput): Promise<any> {
  const { query, data } = input;

  delete data._id;

  const keyToSet = Object.keys(data);
  this.schema.validate(data, keyToSet);

  const instance = await new this.Model().get(query);

  // eslint-disable-next-line guard-for-in
  for (const key in data) {
    const value = data[key];
    if (value !== undefined) instance.set({ [key]: value });
  }

  instance.set({ updatedAt: new Date() });

  if ('beforeUpdate' in instance && typeof instance.beforeUpdate === 'function') {
    await instance.beforeUpdate.call(this, input);
  }

  await instance.save();

  if ('onUpdated' in instance && typeof instance.onUpdated === 'function') {
    await instance.onUpdated.call(this, input);
  }

  return instance.data();
}

export default updateMethod;