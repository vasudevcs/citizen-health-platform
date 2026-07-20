import api from './api';
import type {
  CommunityPost,
  CommunityComment,
  CreatePostPayload,
  PaginatedPosts,
  PostDetail,
  ToggleLikeResult,
  CommunityPostCategory,
} from '../types/community';

export const communityApi = {
  listPosts: async (params: { page?: number; limit?: number; category?: CommunityPostCategory }): Promise<PaginatedPosts> => {
    const { data } = await api.get('/community/posts', { params });
    return { data: data.data, pagination: data.pagination };
  },

  createPost: async (payload: CreatePostPayload): Promise<CommunityPost> => {
    const { data } = await api.post('/community/posts', payload);
    return data.data;
  },

  getPost: async (id: string): Promise<PostDetail> => {
    const { data } = await api.get(`/community/posts/${id}`);
    return data.data;
  },

  deletePost: async (id: string): Promise<{ id: string }> => {
    const { data } = await api.delete(`/community/posts/${id}`);
    return data.data;
  },

  toggleLikePost: async (id: string): Promise<ToggleLikeResult> => {
    const { data } = await api.post(`/community/posts/${id}/like`);
    return data.data;
  },

  addComment: async (postId: string, body: string): Promise<CommunityComment> => {
    const { data } = await api.post(`/community/posts/${postId}/comments`, { body });
    return data.data;
  },

  toggleLikeComment: async (id: string): Promise<ToggleLikeResult> => {
    const { data } = await api.post(`/community/comments/${id}/like`);
    return data.data;
  },
};
