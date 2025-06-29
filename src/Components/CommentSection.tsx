import React from "react";
import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../Subabaseclient";
import { CommentItem } from "./CommentItem";

interface Props {
  postId: number;
}

interface NewComment {
  content: string;
  parent_comment_id?: number | null;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  content: string;
  user_id: string;
  created_at: string;
  author: string;
}

const createComment = async (
  newComment: NewComment,
  postId: number,
  userId?: string,
  author?: string
) => {
  if (!userId || !author) {
    throw new Error("You must be logged in to comment.");
  }

  console.log("Creating comment with:", { newComment, postId, userId, author });

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: newComment.content,
    parent_comment_id: newComment.parent_comment_id || null,
    user_id: userId,
    author: author,
  });

  if (error) {
    console.error("Comment creation error:", error);
    throw new Error(error.message);
  }

  // Update the comment count in the Posts table
  const { data: currentPost, error: fetchError } = await supabase
    .from("Posts")
    .select("comment_count")
    .eq("id", postId)
    .single();

  if (fetchError) {
    console.error("Error fetching current post:", fetchError);
  } else {
    const newCommentCount = (currentPost.comment_count || 0) + 1;
    const { error: updateError } = await supabase
      .from("Posts")
      .update({ comment_count: newCommentCount })
      .eq("id", postId);

    if (updateError) {
      console.error("Error updating comment count:", updateError);
    }
  }
};

const fetchComments = async (postId: number): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Comment[];
};

export const CommentSection = ({ postId }: Props) => {
  const [newCommentText, setNewCommentText] = useState<string>("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: comments,
    isLoading,
    error,
  } = useQuery<Comment[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    refetchInterval: 5000,
  });

  const {
    mutate,
    isPending,
    isError,
    error: mutationError,
  } = useMutation({
    mutationFn: (newComment: NewComment) => {
      const authorName =
        user?.user_metadata?.name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.user_name ||
        user?.email?.split("@")[0] ||
        "Anonymous";
      console.log("User data:", {
        userId: user?.id,
        author: authorName,
        metadata: user?.user_metadata,
      });
      return createComment(newComment, postId, user?.id, authorName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText) return;
    mutate({ content: newCommentText, parent_comment_id: null });
    setNewCommentText("");
  };

  /* Map of Comments - Organize Replies - Return Tree  */
  const buildCommentTree = (
    flatComments: Comment[]
  ): (Comment & { children?: Comment[] })[] => {
    const map = new Map<number, Comment & { children?: Comment[] }>();
    const roots: (Comment & { children?: Comment[] })[] = [];

    flatComments.forEach((comment) => {
      map.set(comment.id, { ...comment, children: [] });
    });

    flatComments.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = map.get(comment.parent_comment_id);
        if (parent) {
          parent.children!.push(map.get(comment.id)!);
        }
      } else {
        roots.push(map.get(comment.id)!);
      }
    });

    return roots;
  };

  if (isLoading) {
    return <div> Loading comments...</div>;
  }

  if (error) {
    return <div> Error: {error.message}</div>;
  }

  const commentTree = comments ? buildCommentTree(comments) : [];

  return (
    <div className="mt-6 bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-semibold mb-4">Comments</h3>
      {/* Create Comment Section */}
      {user ? (
        <form
          onSubmit={handleSubmit}
          className="mb-4 bg-gray-100/90 dark:bg-gray-800/90 p-4 rounded-lg shadow"
        >
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full border border-white/10 bg-white/80 dark:bg-gray-900/80 p-2 rounded text-gray-900 dark:text-white"
            placeholder="Write a comment..."
            rows={3}
          />
          <button
            type="submit"
            className="mt-2 bg-purple-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            {isPending ? "Posting..." : "Post Comment"}
          </button>
          {isError && (
            <p className="text-red-500 mt-2">
              Error posting comment: {mutationError?.message || "Unknown error"}
            </p>
          )}
        </form>
      ) : (
        <p className="mb-4 text-gray-600">
          You must be logged in to post a comment.
        </p>
      )}

      {/* Comments Display Section */}
      <div className="space-y-4">
        {commentTree.map((comment, key) => (
          <CommentItem key={key} comment={comment} postId={postId} />
        ))}
      </div>
    </div>
  );
};
