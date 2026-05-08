'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  useDeleteSongCommentMutation,
  usePostSongCommentMutation,
  useSongCommentsQuery,
} from '@/queries/songCommentQuery';
import useAuthStore from '@/stores/useAuthStore';

import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface SongCommentSectionProps {
  songId: string;
  isExpanded: boolean;
}

export default function SongCommentSection({ songId, isExpanded }: SongCommentSectionProps) {
  const [content, setContent] = useState('');

  const { isAuthenticated, user } = useAuthStore();
  const { data: comments = [], isLoading } = useSongCommentsQuery(songId, isExpanded);
  const { mutate: postComment, isPending: isPosting } = usePostSongCommentMutation(songId);
  const { mutate: deleteComment } = useDeleteSongCommentMutation(songId);

  const handleSubmit = () => {
    if (!isAuthenticated) {
      toast.error('로그인하고 댓글을 작성해보세요!');
      return;
    }
    const trimmed = content.trim();
    if (!trimmed) return;
    if (trimmed.length > 100) {
      toast.error('댓글은 100자 이내로 작성해주세요.');
      return;
    }
    postComment(trimmed, { onSuccess: () => setContent('') });
  };

  return (
    <div className="flex flex-col gap-3 pt-2">
      <span className="text-muted-foreground text-xs font-semibold">댓글</span>

      <div className="flex gap-2">
        <Textarea
          placeholder={
            isAuthenticated ? '댓글을 입력하세요 (최대 100자)' : '로그인 후 댓글 작성 가능'
          }
          value={content}
          onChange={e => setContent(e.target.value)}
          maxLength={100}
          rows={2}
          className="resize-none text-sm"
          disabled={!isAuthenticated}
        />
        <Button
          size="sm"
          className="self-end"
          onClick={handleSubmit}
          disabled={!isAuthenticated || !content.trim() || isPosting}
        >
          {isPosting ? <Loader2 className="h-3 w-3 animate-spin" /> : '등록'}
        </Button>
      </div>
      <div className="text-muted-foreground text-right text-xs">{content.length}/100</div>

      {isLoading ? (
        <div className="flex justify-center py-2">
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground py-2 text-center text-xs">첫 댓글을 남겨보세요!</p>
      ) : (
        <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto">
          {comments.map(comment => (
            <li
              key={comment.id}
              className="bg-muted/30 flex items-start justify-between rounded-md p-2"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold">{comment.nickname}</span>
                <span className="text-sm">{comment.content}</span>
                <span className="text-muted-foreground text-xs">
                  {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
              {user?.id === comment.user_id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => deleteComment(comment.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
