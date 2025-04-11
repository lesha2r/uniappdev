import dotenv from 'dotenv';
import path from 'path';

// Инициализация dotenv
dotenv.config({
  path: path.join(path.resolve(path.dirname('')), '/.env'),
});

const env = {
  mongoLink: process.env.MONGO_LINK,
  mongoUser: process.env.MONGO_USER,
  mongoPassword: process.env.MONGO_PASSWORD,
  mongoSvr: process.env.MONGO_SVR === 'false' ? false : true
};




export default env;
