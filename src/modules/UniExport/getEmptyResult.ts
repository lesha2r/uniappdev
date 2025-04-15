interface EmptyResult {
  details: string;
  path: string;
  filename: string;
  filenameFull: string;
  lifetimeHours: number;
  rows: number;
}

const getEmptyResult = (reason: string = ''): EmptyResult => {
  return {
    details: reason,
    path: '',
    filename: '',
    filenameFull: '',
    lifetimeHours: 0,
    rows: 0,
  };
};

export default getEmptyResult;