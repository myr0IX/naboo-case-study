import { PageTitle } from "@/components";
import { FavoritesItems } from "@/components/FavoritesItems";
import { graphqlClient } from "@/graphql/apollo";
import {
  GetFavoritesQuery,
  GetFavoritesQueryVariables,
} from "@/graphql/generated/types";
import GetFavorites from "@/graphql/queries/auth/getFavorites";
import { withAuth } from "@/hocs";
import { useAuth } from "@/hooks";
import { useLazyQuery } from "@apollo/client";
import { Avatar, Flex, Grid, Loader, Text } from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";

interface ProfileProps {
  favoriteActivities: {
    id: string;
    name: string;
  }[];
}

const Profile = (props: ProfileProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<GetFavoritesQuery["getFavorites"]>(
    []
  );
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (hasFetched) return;

    const fetchFavorites = async () => {
      try {
        const response = await graphqlClient.query<GetFavoritesQuery>({
          query: GetFavorites,
        });
        setFavorites(response.data.getFavorites);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    };

    fetchFavorites();
  }, [hasFetched]);
  return (
    <>
      <Head>
        <title>Mon profil | CDTR</title>
      </Head>
      <PageTitle title="Mon profil" />
      <Grid>
        <Grid.Col>
          <Flex align="center" gap="md">
            <Avatar color="cyan" radius="xl" size="lg">
              {user?.firstName[0]}
              {user?.lastName[0]}
            </Avatar>
            <Flex direction="column">
              <Text>{user?.email}</Text>
              <Text>{user?.firstName}</Text>
              <Text>{user?.lastName}</Text>
              <Text>Role: {user?.role}</Text>
            </Flex>
          </Flex>
        </Grid.Col>
        <Grid.Col>
          {isLoading ? <Loader /> : <FavoritesItems activities={favorites} />}
        </Grid.Col>
      </Grid>
    </>
  );
};

export default withAuth(Profile);
