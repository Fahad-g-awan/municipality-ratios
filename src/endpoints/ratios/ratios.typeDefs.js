import { gql } from "apollo-server-express";

const ratiosTypeDefs = gql`
  scalar Upload

  type Ratios {
    ratioId: Int
    state: String
    city: String
    dateOfAuditReport: String
    yearOfAuditReport: String
    name: String
    descrition: String
    ratio: String
    category: String
    logoUrl: String
  }

  type Query {
    ratios(city: String!): [Ratios]
  }

  type Mutation {
    uploadRatios(files: [Upload]): String
  }
`;

export default ratiosTypeDefs;
