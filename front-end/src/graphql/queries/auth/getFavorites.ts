import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const GetFavorites = gql`
  query GetFavorites {
    getFavorites {
      ...Activity
    }
  }
  ${ActivityFragment}
`;

export default GetFavorites;
