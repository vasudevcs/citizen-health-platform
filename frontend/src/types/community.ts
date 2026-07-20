// ─── Community ────────────────────────────────────────────────────────────────

export type CommunityPostCategory = 'general' | 'support' | 'tips' | 'announcement';

export interface CommunityAuthor {
  _id: string;
  name: string;
  role: string;
}

export interface CommunityPost {
  _id: string;
  author: CommunityAuthor;
  category: CommunityPostCategory;
  title: string;
  body: string;
  tags: string[];
  likes: string[];
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  status: 'active' | 'removed';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  _id: string;
  post: string;
  author: CommunityAuthor;
  body: string;
  likes: string[];
  likesCount: number;
  status: 'active' | 'removed';
  createdAt: string;
}

export interface CreatePostPayload {
  category: CommunityPostCategory;
  title: string;
  body: string;
  tags?: string[];
}

export interface PaginatedPosts {
  data: CommunityPost[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface PostDetail {
  post: CommunityPost;
  comments: CommunityComment[];
}

export interface ToggleLikeResult {
  liked: boolean;
  likesCount: number;
}
