import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2, Send } from 'lucide-react';
import { WidgetCard, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import {
  useCommunityPost,
  useToggleLikePost,
  useToggleLikeComment,
  useAddComment,
  useDeletePost,
} from '../../hooks/useCommunity';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/format';

export default function CommunityPostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError } = useCommunityPost(id);
  const toggleLikePost = useToggleLikePost();
  const toggleLikeComment = useToggleLikeComment(id ?? '');
  const addComment = useAddComment(id ?? '');
  const deletePost = useDeletePost();
  const [comment, setComment] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4 pb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <WidgetCard>
        <EmptyState title="Post not found" description="This post may have been removed." />
      </WidgetCard>
    );
  }

  const { post, comments } = data;
  const liked = !!user && post.likes.includes(user.id);
  const isOwnPost = !!user && post.author._id === user.id;

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment.mutate(comment.trim(), { onSuccess: () => setComment('') });
  };

  const handleDelete = () => {
    if (!id) return;
    if (!window.confirm('Delete this post?')) return;
    deletePost.mutate(id, { onSuccess: () => navigate('/community') });
  };

  return (
    <div className="space-y-4 pb-8">
      <Link to="/community" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">
        <ArrowLeft size={16} /> Back to Community
      </Link>

      <WidgetCard>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {post.category}
            </span>
            <h1 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{post.title}</h1>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {post.author.name} · {timeAgo(post.createdAt)}
            </p>
          </div>
          {isOwnPost && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex-shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              title="Delete post"
              aria-label="Delete post"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{post.body}</p>

        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={() => toggleLikePost.mutate(post._id)}
            aria-label={liked ? 'Unlike post' : 'Like post'}
            className={`flex items-center gap-1.5 text-sm font-medium ${
              liked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-rose-600 dark:text-slate-400'
            }`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            {post.likesCount}
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">{comments.length} comments</span>
        </div>
      </WidgetCard>

      <WidgetCard>
        <div className="flex items-center gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            maxLength={2000}
            placeholder="Add a comment…"
            aria-label="Add a comment"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          <button
            type="button"
            onClick={handleAddComment}
            disabled={addComment.isPending || !comment.trim()}
            aria-label="Post comment"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {comments.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No comments yet. Start the conversation.</p>
          ) : (
            comments.map((c) => {
              const commentLiked = !!user && c.likes.includes(user.id);
              return (
                <div key={c._id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.author.name}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.body}</p>
                  <button
                    type="button"
                    onClick={() => toggleLikeComment.mutate(c._id)}
                    aria-label={commentLiked ? 'Unlike comment' : 'Like comment'}
                    className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                      commentLiked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 hover:text-rose-600'
                    }`}
                  >
                    <Heart size={12} fill={commentLiked ? 'currentColor' : 'none'} />
                    {c.likesCount}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </WidgetCard>
    </div>
  );
}
