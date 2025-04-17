import Schema from 'validno'
import { AuthCreateInput } from '../index.js'
import { AuthActions } from '../../../constants.js'

const validatationSchemaConfig: Partial<Record<keyof AuthCreateInput, any>> = {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
      rules: {
        enum: ['email']
      }
    },
    dbCredentials: {
      link: { type: String, required: true },
      login: { type: String, required: true },
      password: { type: String, required: true },
      dbName: { type: String, required: true },
      debug: { type: Boolean, required: false },
      srv: { type: Boolean, required: false },
    },
    dbCollection: {
      type: String,
      required: false,
    },
    dbTokensCollection: {
      type: String,
      required: false,
    },
    jwtConfig: {
      accessSecret: { type: String, required: true },
      refreshSecret: { type: String, required: true },
      accessLiveTime: { type: String, required: false },
      refreshLiveTime: { type: String, required: false },
    },
    allowedActions: {
      type: Array,
      required: false,
      rules: {
        enum: Object.values(AuthActions),
      },
    }
}

const configSchema = new Schema(validatationSchemaConfig)

const validate = (input: Partial<AuthCreateInput>) => {
    const validationResult = configSchema.validate(input);
    if (!validationResult.ok) throw new Error(validationResult.joinErrors());
}

  export default {
    validate
  }