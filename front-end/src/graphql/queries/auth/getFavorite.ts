import ActivityFragment from "@/graphql/fragments/activity";
import gql from "graphql-tag";

const GetFavorite = gql`
  query GetFavorites {
    getFavorites {
      ...Activity
    }
  }
  ${ActivityFragment}
`;

export default GetFavorite;
