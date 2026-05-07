import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { deleteSongComment, getSongComments, postSongComment } from '@/lib/api/songComment';
import { SongComment } from '@/types/comment';

export const useSongCommentsQuery = (songId: string, enabled: boolean) => {
  return useQuery({
    queryKey: ['songComments', songId],
    queryFn: async () => {
      const response = await getSongComments(songId);
      if (!response.success) return [];
      return response.data ?? [];
    },
    enabled,
  });
};

export const usePostSongCommentMutation = (songId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => postSongComment({ song_id: songId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songComments', songId] });
      toast.success('댓글이 등록되었습니다.');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? '댓글 등록 실패');
    },
  });
};

export const useDeleteSongCommentMutation = (songId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteSongComment({ commentId }),
    onMutate: async (commentId: string) => {
      await queryClient.cancelQueries({ queryKey: ['songComments', songId] });
      const prev = queryClient.getQueryData<SongComment[]>(['songComments', songId]);
      queryClient.setQueryData<SongComment[]>(['songComments', songId], old =>
        (old ?? []).filter(c => c.id !== commentId),
      );
      return { prev };
    },
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.');
    },
    onError: (error: Error, _id, context) => {
      queryClient.setQueryData(['songComments', songId], context?.prev);
      toast.error(error.message ?? '댓글 삭제 실패');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['songComments', songId] });
    },
  });
};
