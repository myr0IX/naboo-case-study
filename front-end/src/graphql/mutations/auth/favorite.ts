import { gql } from "@apollo/client";

export const AddFavorite = gql`
  mutation AddFavorite($id: String!) {
    addFavorite(id: $id) {
      id
      city
    }
  }
`;

export const RemoveFavorite = gql`
  mutation RemoveFavorite($id: String!) {
    removeFavorite(id: $id) {
      id
      city
    }
  }
`;

export const ReorderFavorites = gql`
mutation ReorderFavorites($newOrder: [String!]!) {
  reorderFavorites(newOrder : $newOrder) {
    id
    city
    name
  }
}`;
