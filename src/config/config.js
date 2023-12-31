import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envSchema = Joi.object()
  .keys({
    PORT: Joi.number().required(),
    MONGODB_NAME: Joi.string().required(),
    MONGODB_URI: Joi.string().required(),
  })
  .unknown();

// Load and validate the environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  mongoose: {
    uri: `${envVars.MONGODB_URI}/${envVars.MONGODB_NAME}`,
    name: envVars.MONGODB_NAME,
    options: {
      // useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    port: envVars.PORT,
  },
};
