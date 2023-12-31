import mongoose from "mongoose";

import config from "../config/config.js";

mongoose.set("strictQuery", false);
mongoose.connect(config.mongoose.uri, config.mongoose.options);

export default mongoose.connection;
