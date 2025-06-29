import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../Subabaseclient";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";

interface Props {
  postId: number;
}

const fetchPostById = async (id: number) => {
  const { data, error } = await supabase
    .from("Posts")
    .select("*, communities(name)")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const PostDetail = ({ postId }: Props) => {
  const {
    data: post,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPostById(postId),
  });
  const [reaction, setReaction] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(post?.like_count ?? 0);

  const avatar =
    post?.avatar_url ||
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
  const author = post?.author || "User";
  const communityName = post?.communities?.name || "Community";

  const handleReact = async (type: "like" | "love" | "dislike") => {
    setReaction(type);
    if (type === "like" || type === "love") setLikeCount(likeCount + 1);
    if (type === "dislike" && likeCount > 0) setLikeCount(likeCount - 1);
    await supabase.from("votes").upsert({
      post_id: postId,
      reaction: type,
    });
    if (type === "like" || type === "love") {
      await supabase
        .from("Posts")
        .update({ like_count: likeCount + 1 })
        .eq("id", postId);
    } else if (type === "dislike") {
      await supabase
        .from("Posts")
        .update({ like_count: likeCount - 1 })
        .eq("id", postId);
    }
  };

  if (isLoading) return <div>Loading post...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-8 mt-12 flex flex-col gap-4">
      {/* Header: Avatar, User, Community */}
      <div className="flex items-center gap-4 mb-2">
        <img
          src={avatar}
          alt="User Avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 dark:text-white text-lg">
            {author}
          </div>
          <div className="text-xs text-gray-500">in {communityName}</div>
        </div>
      </div>
      {/* Date */}
      <div className="text-xs text-gray-400 mb-2">
        {new Date(post.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
      {/* Content */}
      <div className="mb-3">
        <div className="text-gray-800 dark:text-gray-200 text-base mb-2 leading-relaxed">
          {post.content}
        </div>
        {post.img_url && (
          <img
            src={post.img_url}
            alt={post.title}
            className="w-full rounded-md object-cover max-h-96 mx-auto border border-gray-200 dark:border-gray-700"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>
      {/* Reactions and Comments */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mb-4">
        <div className="flex items-center gap-3">
          <button
            className={`flex items-center gap-2 text-xl focus:outline-none hover:scale-110 transition-transform duration-200 ${
              reaction === "like" ? "text-pink-500" : "text-gray-400"
            }`}
            onClick={() => handleReact("like")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={reaction === "like" ? "#ec4899" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke={reaction === "like" ? "#ec4899" : "currentColor"}
              className="w-8 h-8 transition-all duration-200"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.435 6.582a5.373 5.373 0 00-7.606 0l-.829.828-.828-.828a5.373 5.373 0 00-7.606 7.606l.828.828 7.606 7.606 7.606-7.606.828-.828a5.373 5.373 0 000-7.606z"
              />
            </svg>
            <span className="text-sm font-semibold">Like</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <span>💬</span>
          <span className="text-sm font-medium">
            {post.comment_count ?? 0} Comments
          </span>
        </div>
      </div>
      {/* Comments Section */}
      <CommentSection postId={postId} />
    </div>
  );
};
