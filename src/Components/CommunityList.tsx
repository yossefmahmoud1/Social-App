import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../Subabaseclient";
import { Link } from "react-router-dom";

export interface Community {
  id: number;
  name: string;
  description: string;
  created_at: string;
}
export const fetchCommunities = async (): Promise<Community[]> => {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("Communities data:", data, "error:", error);

  if (error) throw new Error(error.message);
  return data as Community[];
};

export const CommunityList = () => {
  const { data, error, isLoading } = useQuery<Community[], Error>({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <svg
          className="animate-spin h-8 w-8 text-purple-500 mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        <div className="text-center text-gray-500">Loading communities...</div>
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 py-4">
        Error: {error.message}
      </div>
    );
  if (!data || data.length === 0)
    return (
      <div className="text-center text-gray-400 py-8">
        No communities found.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {data?.map((community) => (
        <div
          key={community.id}
          className="border border-white/10 p-4 rounded hover:-translate-y-1 transition transform"
        >
          <Link
            to={`/community/${community.id}`}
            className="text-2xl font-bold text-purple-500 hover:underline"
          >
            {community.name}
          </Link>
          <p className="text-gray-400 mt-2">{community.description}</p>
        </div>
      ))}
    </div>
  );
};
