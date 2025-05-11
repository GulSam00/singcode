// hooks/useToSingList.ts
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { usePostSingLogMutation } from '@/queries/singLogQuery';
import {
  useDeleteToSingSongMutation,
  usePatchToSingSongMutation,
  useToSingSongQuery,
} from '@/queries/tosingSongQuery';

export default function useSong() {
  const { data, isLoading } = useToSingSongQuery();
  const { mutate: patchToSingSong } = usePatchToSingSongMutation();
  const { mutate: deleteToSingSong } = useDeleteToSingSongMutation();
  const { mutate: postSingLog } = usePostSingLogMutation();
  const toSingSongs = data ?? [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = toSingSongs.findIndex(item => item.songs.id === active.id);
    const newIndex = toSingSongs.findIndex(item => item.songs.id === over.id);

    if (oldIndex === newIndex) return;

    const newItems = arrayMove(toSingSongs, oldIndex, newIndex);
    const prevItem = newItems[newIndex - 1];
    const nextItem = newItems[newIndex + 1];

    let newWeight;

    if (!prevItem && nextItem) {
      // 제일 앞으로 이동한 경우
      newWeight = toSingSongs[0].order_weight - 1;
    } else if (prevItem && !nextItem) {
      // 제일 뒤로 이동한 경우
      newWeight = toSingSongs[toSingSongs.length - 1].order_weight + 1;
    } else {
      // 중간에 삽입
      newWeight = (prevItem.order_weight + nextItem.order_weight) / 2;
    }

    patchToSingSong({
      songId: active.id as string,
      newWeight,
      newItems,
    });
  };

  const handleDelete = (songId: string) => {
    deleteToSingSong(songId);
  };

  const handleMoveToTop = (songId: string, oldIndex: number) => {
    if (oldIndex === 0) return;

    const newItems = arrayMove(toSingSongs, oldIndex, 0);
    const newWeight = toSingSongs[0].order_weight - 1;

    patchToSingSong({
      songId: songId,
      newWeight,
      newItems,
    });
  };

  const handleMoveToBottom = (songId: string, oldIndex: number) => {
    const lastIndex = toSingSongs.length - 1;
    if (oldIndex === lastIndex) return;

    const newItems = arrayMove(toSingSongs, oldIndex, lastIndex);
    const newWeight = toSingSongs[lastIndex].order_weight + 1;

    patchToSingSong({
      songId: songId,
      newWeight,
      newItems,
    });
  };

  const handleSung = async (songId: string) => {
    // 순서 이동
    const oldIndex = toSingSongs.findIndex(item => item.songs.id === songId);
    handleMoveToBottom(songId, oldIndex);

    // 통계 업데이트
    await Promise.all([
      // postTotalStat({ songId, countType: 'sing_count', isMinus: false }),
      // postUserStat(songId),
      postSingLog(songId),
      handleDelete(songId),
    ]);
  };

  return {
    toSingSongs,
    isLoading,
    handleDragEnd,
    handleDelete,
    handleMoveToTop,
    handleMoveToBottom,
    handleSung,
  };
}
