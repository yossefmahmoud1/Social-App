import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../Subabaseclient";
import { PostItem } from "./PostItem";
export interface Post {
  id: number;
  title: string;
  avatar_url: string;
  created_at: string;
  content: string;
  img_url: string;
  like_count?: number;
  comment_count?: number;
  community_id?: number;
  author: string;
  communities?: { name?: string };
}

const PostList = ({ communityId }: { communityId?: number }) => {
  const fetchPosts = async (): Promise<Post[]> => {
    let query = supabase
      .from("Posts")
      .select("*, communities(name)")
      .order("created_at", { ascending: false });
    if (communityId) {
      query = query.eq("community_id", communityId);
    }
    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return data as Post[];
  };

  const { data, error, isLoading } = useQuery<Post[], Error>({
    queryKey: ["posts", communityId],
    queryFn: fetchPosts,
  });

  if (isLoading) {
    return (
      <div className="col-span-full flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-lg">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full flex justify-center items-center py-12">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Failed to load posts
          </h3>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="col-span-full flex justify-center items-center py-12">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No posts yet
          </h3>
          <p className="text-gray-400">Be the first to create a post!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex justify-center items-start py-12">
      <div className="w-full max-w-2xl flex flex-col gap-6 px-2 sm:px-0 mx-auto">
        {data.map((post, key) => (
          <PostItem key={key} post={post} />
        ))}
      </div>
    </div>
  );
};

export default PostList;
