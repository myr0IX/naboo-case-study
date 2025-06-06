import { ActivityFragment, User } from "@/graphql/generated/types";
import { useAuth } from "@/hooks";
import { useGlobalStyles } from "@/utils";
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
}

export function Activity({ activity }: ActivityProps) {
  const { classes } = useGlobalStyles();
  const [favorite, setFavorite] = useState(false);
  const { user } = useAuth();

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
            onClick={() => setFavorite((prev) => !prev)}
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
          {user?.role === "admin" && activity.createdAt ? (
            <Badge color="blue" variant="light">
              {`${returnDate(activity.createdAt)}`}
            </Badge>
          ) : null}
        </Group>

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
