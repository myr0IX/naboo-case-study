import { Activity, EmptyData, PageTitle } from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import {
  ActivityFragment,
  GetFavoritesQuery,
  GetFavoritesQueryVariables,
} from "@/graphql/generated/types";
import GetFavorite from "@/graphql/queries/auth/getFavorites";
import { withAuth } from "@/hocs";
import { Button, Grid, Group } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { DndContext, closestCenter } from "@dnd-kit/core";

interface FavoriteActivitiesProps {
  activities: GetFavoritesQuery["getFavorites"];
}

export const getServerSideProps: GetServerSideProps<
  FavoriteActivitiesProps
> = async ({ req }) => {
  const response = await graphqlClient.query<
    GetFavoritesQuery,
    GetFavoritesQueryVariables
  >({
    query: GetFavorite,
    context: { headers: { Cookie: req.headers.cookie } },
  });
  return { props: { activities: response.data.getFavorites } };
};

const FavoriteActivitiesList = ({ activities }: FavoriteActivitiesProps) => {
  console.debug("FavoriteActivitiesList activities:", activities);
  const [favorites, handlers] = useListState<ActivityFragment>(activities);
  const saveNewOrder = async () => {
    const ids = favorites.map((a) => a.id);
    // Appelle ta mutation GraphQL ici
    // await reorderFavorites({ variables: { newOrder: ids } });
  };
  return (
    <>
      <Head>
        <title>Activiées favoris | CDTR</title>
      </Head>
      <Group position="apart">
        <PageTitle title="Vos activitées favoris" />
      </Group>
      <Grid>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <Activity activity={activity} key={activity.id} isFavorite={true} />
          ))
        ) : (
          <EmptyData />
        )}
      </Grid>
    </>
  );
};

export default withAuth(FavoriteActivitiesList);
