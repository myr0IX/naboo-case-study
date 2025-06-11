import {
  ActivityFragment
} from "@/graphql/generated/types";
import { AddFavorite, RemoveFavorite } from "@/graphql/mutations/auth/favorite";
import { useAuth } from "@/hooks";
import { useGlobalStyles } from "@/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
import { Favorite } from "./Favorite";
import { useMutation } from "@apollo/client";

interface ActivityProps {
  activity: ActivityFragment;
}

export function Activity({ activity}: ActivityProps) {
  const { classes } = useGlobalStyles();
  const [favorite, setFavorite] = useState(false);
  const { user } = useAuth();

  const [addFavorite] = useMutation(AddFavorite, {
    refetchQueries: ["GetFavorites"],
  });

  const [removeFavorite] = useMutation(RemoveFavorite, {
    refetchQueries: ["GetFavorites"],
  });
  const updateFavorite = async (value: boolean) => {
    if (!user) {
      console.warn("User not authenticated, cannot update favorite");
      return value;
    }
    if (value) {
      await removeFavorite({ variables: { id: activity.id } });
    } else {
      await addFavorite({ variables: { id: activity.id } });
    }
    return !value;
  };

  function returnDate(str: string): string {
    const date = new Date(str);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  }

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    display: "inline-block",
  };

  return (
    <Grid.Col
      span={4}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
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
          <Favorite activityId={activity.id} />
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
