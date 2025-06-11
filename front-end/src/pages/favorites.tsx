import { Activity, EmptyData, PageTitle } from "@/components";
import { graphqlClient } from "@/graphql/apollo";
import {
  ActivityFragment,
  GetFavoritesQuery,
  GetFavoritesQueryVariables,
} from "@/graphql/generated/types";
import GetFavorite from "@/graphql/queries/auth/getFavorites";
import { withAuth } from "@/hocs";
import { Grid, Group } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  useSortable,
  sortableKeyboardCoordinates,
  SortableContext,
  rectSwappingStrategy,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";

interface FavoriteActivitiesProps {
  activities: GetFavoritesQuery["getFavorites"];
}

interface DndListProps {
  items: ActivityFragment[];
}

interface SortableProps {
  activity: ActivityFragment;
  index: number;
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
  const [favorites, handlers] = useListState(activities);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = favorites.findIndex((item) => item.id === active.id);
      const newIndex = favorites.findIndex((item) => item.id === over?.id);
      handlers.reorder({ from: oldIndex, to: newIndex });

	  const newOrder = favorites.map((fav) => fav.id);
	  await reorderFavorites({
		variables: { newOrder }, // array of string ids
	  });
    }

    // TODO: update db
  };

  return (
    <>
      <Head>
        <title>Activiées favoris | CDTR</title>
      </Head>
      <Group position="apart">
        <PageTitle title="Activitées favoris" />
      </Group>
      {favorites.length > 0 ? (
        <DndContext
          id="favorites-dnd"
          sensors={sensors}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <SortableContext items={favorites} strategy={horizontalListSortingStrategy}>
            <DndList items={favorites} />
          </SortableContext>
        </DndContext>
      ) : (
        <Grid>
          <EmptyData />
        </Grid>
      )}
    </>
  );
};

function DndList({ items }: DndListProps) {
  return (
    <Grid>
      {items.map((item) => (
        <Activity key={item.id} activity={item} isFavorite={true} isDnD={true} />
      ))}
    </Grid>
  );
}

export default withAuth(FavoriteActivitiesList);
