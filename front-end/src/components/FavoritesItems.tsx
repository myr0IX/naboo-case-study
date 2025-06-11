import { Activity, EmptyData, PageTitle } from "@/components";
import { ActivityFragment, GetFavoritesQuery } from "@/graphql/generated/types";
import { Grid, Group, Title } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import {
  sortableKeyboardCoordinates,
  SortableContext,
  rectSwappingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation } from "@apollo/client";
import { ReorderFavorites } from "@/graphql/mutations/auth/favorite";
import { useState } from "react";

interface FavoriteActivitiesProps {
  activities: GetFavoritesQuery["getFavorites"];
}

interface DndListProps {
  items: ActivityFragment[];
}

export function FavoritesItems({ activities }: FavoriteActivitiesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reorderFavorites] = useMutation(ReorderFavorites);
  const [favorites, handlers] = useListState(activities);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || isLoading) return;

    const oldIndex = favorites.findIndex((item) => item.id === active.id);
    const newIndex = favorites.findIndex((item) => item.id === over.id);

    const updated = arrayMove(favorites, oldIndex, newIndex);
    handlers.setState(updated);

    setIsLoading(true);
    try {
      await reorderFavorites({
        variables: { newOrder: updated.map((item) => item.id) },
      });
    } catch (error) {
      console.error("Erreur reorderFavorites :", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Group position="apart">
        <Title order={2}>Favoris</Title>
      </Group>
      {favorites.length > 0 ? (
        <DndContext
          id="favorites-dnd"
          sensors={sensors}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <SortableContext items={favorites} strategy={rectSwappingStrategy}>
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
}

function DndList({ items }: DndListProps) {
  return (
    <Grid>
      {items.map((item) => (
        <Activity
          key={item.id}
          activity={item}
        />
      ))}
    </Grid>
  );
}
