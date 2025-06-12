import { PageTitle } from "@/components";
import { Favorite } from "@/components/Favorite";
import { graphqlClient } from "@/graphql/apollo";
import {
  GetActivityQuery,
  GetActivityQueryVariables,
} from "@/graphql/generated/types";
import GetActivity from "@/graphql/queries/activity/getActivity";
import { useAuth } from "@/hooks";
import {
  Badge,
  Container,
  Flex,
  Grid,
  Group,
  Image,
  Text,
} from "@mantine/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { relative } from "path";

interface ActivityDetailsProps {
  activity: GetActivityQuery["getActivity"];
}

function returnDate(str: string): string {
  const date = new Date(str);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export const getServerSideProps: GetServerSideProps<
  ActivityDetailsProps
> = async ({ params, req }) => {
  if (!params?.id || Array.isArray(params.id)) return { notFound: true };
  const response = await graphqlClient.query<
    GetActivityQuery,
    GetActivityQueryVariables
  >({
    query: GetActivity,
    variables: { id: params.id },
    context: { headers: { Cookie: req.headers.cookie } },
  });
  return { props: { activity: response.data.getActivity } };
};

export default function ActivityDetails({ activity }: ActivityDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <>
      <Head>
        <title>{`${activity.name} | CDTR`}</title>
      </Head>
      <PageTitle title={activity.name} prevPath={router.back} />
      <Grid>
        <Grid.Col span={7}>
          <Container style={{ position: "relative", display: "inline-block", padding: 0 }}>
            <Image
              src="https://dummyimage.com/640x4:3"
              radius="md"
              alt="random image of city"
              width="100%"
              height="400"
            />
            <Favorite activityId={activity.id} />
          </Container>
        </Grid.Col>
        <Grid.Col span={5}>
          <Flex direction="column" gap="md">
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
            <Text size="sm">{activity.description}</Text>
            <Text size="sm" color="dimmed">
              Ajouté par {activity.owner.firstName} {activity.owner.lastName}
            </Text>
          </Flex>
        </Grid.Col>
      </Grid>
    </>
  );
}
