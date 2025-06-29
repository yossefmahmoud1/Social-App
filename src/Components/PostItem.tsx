import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../Subabaseclient";
import { Post } from "./PostList";

interface Props {
  post: Post & { communities?: { name?: string } };
}

export const PostItem = ({ post }: Props) => {
  const avatar =
    post.avatar_url ||
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
  const author = post.author || "User";
  const communityName = post.communities?.name || "";
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(likeCount + (liked ? -1 : 1));
    await supabase.from("votes").upsert({ post_id: post.id, reaction: "like" });
    await supabase
      .from("Posts")
      .update({ like_count: likeCount + (liked ? -1 : 1) })
      .eq("id", post.id);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
      {/* Header: Avatar, Username, Community */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <img
          src={avatar}
          alt="User Avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 dark:text-white text-lg leading-tight truncate">
            {author}
          </div>
          {communityName && (
            <div className="text-sm text-gray-500 leading-tight truncate">
              in {communityName}
            </div>
          )}
        </div>
      </div>
      {/* Main Image */}
      {post.img_url && (
        <img
          src={post.img_url}
          alt={post.title}
          className="w-full object-cover max-h-96 bg-gray-100 dark:bg-gray-700"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
      {/* Interaction Buttons */}
      <div className="flex items-center gap-8 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <button
          className={`flex items-center gap-2 text-xl focus:outline-none hover:scale-110 transition-transform duration-200 ${
            liked ? "text-pink-500" : "text-gray-400 dark:text-gray-200"
          }`}
          onClick={handleLike}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={liked ? "#ec4899" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke={liked ? "#ec4899" : "currentColor"}
            className="w-8 h-8 transition-all duration-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.435 6.582a5.373 5.373 0 00-7.606 0l-.829.828-.828-.828a5.373 5.373 0 00-7.606 7.606l.828.828 7.606 7.606 7.606-7.606.828-.828a5.373 5.373 0 000-7.606z"
            />
          </svg>
        </button>
        <Link
          to={`/post/${post.id}`}
          className="flex items-center gap-2 text-xl text-gray-500 dark:text-gray-300 hover:text-blue-500 hover:scale-110 transition-all duration-200"
        >
          <span>💬</span>
          <span className="text-sm font-medium">{post.comment_count ?? 0}</span>
        </Link>
        <span className="ml-auto text-xs text-gray-400">
          {new Date(post.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      {/* Like Count */}
      <div className="px-6 pt-3 text-sm font-semibold text-gray-900 dark:text-white">
        {likeCount} {likeCount === 1 ? "like" : "likes"}
      </div>
      {/* Description */}
      <div className="px-6 pt-2 pb-3 text-gray-800 dark:text-gray-200 text-base leading-relaxed">
        {post.content}
      </div>
    </div>
  );
};
