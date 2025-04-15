interface DeleteInput {
  query: Record<string, any>;
  [key: string]: any; // Allow additional properties
}

async function deleteMethod(this: any, input: DeleteInput): Promise<boolean> {
  const { query } = input;

  const instance = await new this.Model().get(query);
  const dataFrozen = JSON.parse(JSON.stringify(instance.data()));

  const inputRe = {
    ...input,
    data: dataFrozen,
  };

  // Коллбек по модели
  if ('beforeDelete' in instance && typeof instance.beforeDelete === 'function') {
    await instance.beforeDelete.call(this, inputRe);
  }

  await instance.delete();

  // Коллбек по модели
  if ('onDeleted' in instance && typeof instance.onDeleted === 'function') {
    await instance.onDeleted(inputRe);
  }

  return true;
}

export default deleteMethod;