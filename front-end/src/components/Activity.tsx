import {
  ActivityFragment,
  MutationAddFavoriteArgs,
  User,
} from "@/graphql/generated/types";
import { AddFavorite, RemoveFavorite } from "@/graphql/mutations/auth/favorite";
import { useAuth } from "@/hooks";
import { routes } from "@/routes";
import { useGlobalStyles } from "@/utils";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Text,
  ActionIcon,
} from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

interface ActivityProps {
  activity: ActivityFragment;
  isFavorite?: boolean;
}

export function Activity({ activity, isFavorite}: ActivityProps) {
  const { classes } = useGlobalStyles();
  const [favorite, setFavorite] = useState(isFavorite ? isFavorite : false);
  const { user } = useAuth();

  console.debug("is favorite:", isFavorite);
  const [addFavorite] = useMutation(AddFavorite, {
    refetchQueries: ["GetFavorites"],
  });

  const [removeFavorite] = useMutation(RemoveFavorite, {
    refetchQueries: ["GetFavorites"],
  });
  const updateFavorite = (value: boolean) => {
	console.debug("Updating favorite status:", value);
    if (!user) {
      console.warn("User not authenticated, cannot update favorite");
      //   routes.push("/signin");
      return value;
    }
    if (value) {
		removeFavorite({ variables: { id: activity.id } });
	} else {
		addFavorite({ variables: { id: activity.id } });
    }
    return !value;
  };

  function returnDate(str: string): string {
    const date = new Date(str);
    return date.toLocaleDateString("fr-FR", {
      //   weekday: "long",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  }

  return (
    <Grid.Col span={4}>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{ position: "relative" }}
      >
        <Card.Section>
          <Image
            src="https://dummyimage.com/480x4:3"
            height={160}
            alt="random image of city"
          />
          <ActionIcon
            variant="light"
            color={favorite ? "red" : "gray"}
            onClick={() => setFavorite((prev) => updateFavorite(prev))}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1,
            }}
          >
            {favorite ? <IconHeartFilled /> : <IconHeart />}
          </ActionIcon>
        </Card.Section>

        <Group position="apart" mt="md" mb="xs">
          <Text weight={500} className={classes.ellipsis}>
            {activity.name}
          </Text>
        </Group>

        <Group mt="md" mb="xs">
          <Badge color="pink" variant="light">
            {activity.city}
          </Badge>
          <Badge color="yellow" variant="light">
            {`${activity.price}€/j`}
          </Badge>
        </Group>
          {user?.role === "admin" && activity.createdAt ? (
            <Badge color="blue" variant="light">
              {`${returnDate(activity.createdAt)}`}
            </Badge>
          ) : null}

        <Text size="sm" color="dimmed" className={classes.ellipsis}>
          {activity.description}
        </Text>

        <Link href={`/activities/${activity.id}`} className={classes.link}>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md">
            Voir plus
          </Button>
        </Link>
      </Card>
    </Grid.Col>
  );
}
