import React from "react";
import { useParams } from "react-router-dom";
import { CommunityDisplay } from "../Components/CommunityDisplay";

export const CommunityPage = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="pt-20">
      <CommunityDisplay communityId={Number(id)} />
    </div>
  );
};
