import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../services/communityService';
import type { CommunityPostCategory, CreatePostPayload } from '../types/community';

export const communityKeys = {
  posts: (page: number, category?: CommunityPostCategory) => ['community', 'posts', page, category ?? 'all'] as const,
  post: (id: string) => ['community', 'post', id] as const,
};

// ─── Feed ───────────────────────────────────────────────────────────────────
export function useCommunityPosts(page = 1, category?: CommunityPostCategory) {
  return useQuery({
    queryKey: communityKeys.posts(page, category),
    queryFn: () => communityApi.listPosts({ page, limit: 20, category }),
    staleTime: 30_000,
  });
}

// ─── Post detail + comments ─────────────────────────────────────────────────
export function useCommunityPost(id: string | undefined) {
  return useQuery({
    queryKey: communityKeys.post(id ?? ''),
    queryFn: () => communityApi.getPost(id as string),
    enabled: !!id,
    staleTime: 15_000,
  });
}

// ─── Create post ─────────────────────────────────────────────────────────────
export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => communityApi.createPost(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });
}

// ─── Delete post ──────────────────────────────────────────────────────────────
export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityApi.deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });
}

// ─── Like toggle (post) ───────────────────────────────────────────────────────
export function useToggleLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityApi.toggleLikePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

// ─── Add comment ──────────────────────────────────────────────────────────────
export function useAddComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => communityApi.addComment(postId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communityKeys.post(postId) });
      qc.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });
}

// ─── Like toggle (comment) ─────────────────────────────────────────────────────
export function useToggleLikeComment(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityApi.toggleLikeComment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communityKeys.post(postId) });
    },
  });
}
