import { graphqlClient } from "@/graphql/apollo";
import { GetFavoritesQuery } from "@/graphql/generated/types";
import { AddFavorite, RemoveFavorite } from "@/graphql/mutations/auth/favorite";
import GetFavorites from "@/graphql/queries/auth/getFavorites";
import { useAuth } from "@/hooks";
import { useMutation } from "@apollo/client";

import { ActionIcon } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface FavoritePros {
  activityId: string;
}

export function Favorite({ activityId }: FavoritePros) {
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  //   const [isLoading, setIsLoading] = useState(true);
  //   const [hasFetched, setHasFetched] = useState(false);

  const [addFavorite] = useMutation(AddFavorite, {
    refetchQueries: [{ query: GetFavorites }],
  });

  const [removeFavorite] = useMutation(RemoveFavorite, {
    refetchQueries: [{ query: GetFavorites }],
  });

  const updateFavorite = async () => {
    try {
      if (!user) {
        setIsFavorite(false);
        //   console.warn("User not authenticated, cannot update favorite");
        return;
      }
      if (isFavorite === true) {
        await removeFavorite({ variables: { id: activityId } });
      } else {
        await addFavorite({ variables: { id: activityId } });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error(error);
    }
  };

  const onClickHandler = () => {
    updateFavorite();
  };

  useEffect(() => {
    if (!user) {
      //   setIsLoading(false);
      return;
    }
    const fetchFavorites = async () => {
      try {
        const { data } = await graphqlClient.query<GetFavoritesQuery>({
          query: GetFavorites,
        });
        const isFav = data.getFavorites.some((fav) => fav.id === activityId);
        setIsFavorite(isFav);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFavorites();
  }, [user, activityId]);

  return (
    <ActionIcon
      variant="light"
      color={isFavorite ? "red" : "gray"}
      onClick={onClickHandler}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
      }}
    >
      {isFavorite ? <IconHeartFilled /> : <IconHeart />}
    </ActionIcon>
  );
}
