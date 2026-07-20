import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageCircle, Heart, Pin, Plus, X } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import { useCommunityPosts, useCreatePost, useToggleLikePost } from '../../hooks/useCommunity';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/format';
import type { CommunityPostCategory } from '../../types/community';

const CATEGORIES: { value: CommunityPostCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'support', label: 'Support' },
  { value: 'tips', label: 'Tips' },
  { value: 'announcement', label: 'Announcements' },
];

// ─── New post composer ──────────────────────────────────────────────────────
function NewPostForm({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<CommunityPostCategory>('general');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const createPost = useCreatePost();

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) return;
    createPost.mutate(
      { category, title: title.trim(), body: body.trim() },
      { onSuccess: onClose }
    );
  };

  return (
    <WidgetCard>
      <div className="flex items-center justify-between">
        <SectionHeader title="Share with the community" />
        <button type="button" onClick={onClose} aria-label="Close composer" className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <X size={16} />
        </button>
      </div>
      <div className="mt-3 space-y-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CommunityPostCategory)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Title"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="What would you like to share?"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createPost.isPending || !title.trim() || !body.trim()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {createPost.isPending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </WidgetCard>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [category, setCategory] = useState<CommunityPostCategory | 'all'>('all');
  const [showComposer, setShowComposer] = useState(false);
  const { data, isLoading } = useCommunityPosts(1, category === 'all' ? undefined : category);
  const toggleLike = useToggleLikePost();

  const posts = data?.data ?? [];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Community Forums</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Connect with others, share experiences, and find support.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowComposer((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {showComposer && <NewPostForm onClose={() => setShowComposer(false)} />}

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              category === c.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <WidgetCard>
          <EmptyState
            icon={<Users size={40} />}
            title="No posts yet"
            description="Be the first to start a conversation in this category."
          />
        </WidgetCard>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const liked = !!user && post.likes.includes(user.id);
            return (
              <WidgetCard key={post._id} hover>
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/community/${post._id}`} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {post.isPinned && <Pin size={13} className="flex-shrink-0 text-indigo-500" />}
                      <span className="truncate text-sm font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                        {post.title}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{post.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize dark:bg-slate-800">{post.category}</span>
                      <span>{post.author.name}</span>
                      <span>·</span>
                      <span>{timeAgo(post.createdAt)}</span>
                    </div>
                  </Link>
                </div>
                <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => toggleLike.mutate(post._id)}
                    aria-label={liked ? 'Unlike post' : 'Like post'}
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      liked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-rose-600 dark:text-slate-400'
                    }`}
                  >
                    <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                    {post.likesCount}
                  </button>
                  <Link to={`/community/${post._id}`} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                    <MessageCircle size={14} />
                    {post.commentsCount}
                  </Link>
                </div>
              </WidgetCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
