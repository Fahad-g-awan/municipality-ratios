import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";

import ratiosTypeDefs from "./ratios/ratios.typeDefs.js";
import ratiosResolver from "./ratios/ratios.resolver.js";

const type = [ratiosTypeDefs];
const resolver = [ratiosResolver];

const typeDefs = mergeTypeDefs(type);
const resolvers = mergeResolvers(resolver);

export { typeDefs, resolvers };
