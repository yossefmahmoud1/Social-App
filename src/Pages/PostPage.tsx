import React from "react";
import { useParams } from "react-router-dom";
import { PostDetail } from "../Components/PostDetail";

export const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="pt-20">
      <PostDetail postId={Number(id)} />
    </div>
  );
};
