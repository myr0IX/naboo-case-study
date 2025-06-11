import { graphqlClient } from "@/graphql/apollo";
import { GetFavoritesQuery } from "@/graphql/generated/types";
import { AddFavorite, RemoveFavorite } from "@/graphql/mutations/auth/favorite";
import GetFavorites from "@/graphql/queries/auth/getFavorites";
import { useAuth, useSnackbar } from "@/hooks";
import { useMutation } from "@apollo/client";

import { ActionIcon } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface FavoritePros {
  activityId: string;
}

export function Favorite({ activityId }: FavoritePros) {
  const { user } = useAuth();
  const snackbar = useSnackbar();


  const [isFavorite, setIsFavorite] = useState(false);

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
        snackbar.error("Connexion requise");
        return;
      }
      if (isFavorite === true) {
        await removeFavorite({ variables: { id: activityId } });
      } else {
		snackbar.success("Favori ajouté avec succès");
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
