interface DeleteRecordInput {
  query: Record<string, any>;
  user?: any;
}

interface DeleteManyInput {
  queries: Record<string, any>[];
  user?: any;
  idByKey: string;
}

async function deleteRecord(this: any, query: Record<string, any>, user?: any): Promise<boolean> {
  const instance = await new this.Model().get({ ...query });
  const dataFrozen = JSON.parse(JSON.stringify(instance.data()));

  const inputRe = {
    data: dataFrozen,
    user,
  };

  if ('beforeDelete' in instance && typeof instance.beforeDelete === 'function') {
    await instance.beforeDelete.call(this, inputRe);
  }

  await instance.delete();

  if ('onDeleted' in instance && typeof instance.onDeleted === 'function') {
    await instance.onDeleted(inputRe);
  }

  return true;
}

async function deleteOne(this: any, query: Record<string, any>, user?: any): Promise<boolean> {
  if (!query) {
    throw new Error('Не удалось удалить одну из записей deleteManyRecords');
  }
  try {
    return await deleteRecord.call(this, query, user);
  } catch (err) {
    return false;
  }
}

async function deleteManyMethod(this: any, input: DeleteManyInput): Promise<Record<string, boolean>> {
  const { queries, user, idByKey } = input;

  const promises: Promise<boolean>[] = [];

  let i = 0;
  while (i < queries.length) {
    const query = queries[i];
    promises.push(deleteOne.call(this, query, user));
    i++;
  }

  const results = await Promise.all(promises);
  const resultsById = queries.reduce((acc, cur, i) => {
    return { ...acc, [cur[idByKey]]: results[i] };
  }, {});

  return resultsById;
}

export default deleteManyMethod;