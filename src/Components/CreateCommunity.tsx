import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Subabaseclient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CommunityInput {
  name: string;
  description: string;
}

const createCommunity = async (community: CommunityInput) => {
  const { error, data } = await supabase.from("communities").insert(community);

  if (error) throw new Error(error.message);
  return data;
};

export const CreateCommunity = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, status } = useMutation({
    mutationFn: createCommunity,
    onError: (err: any) => {
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "colored",
      });
    },
    onSuccess: () => {
      toast.success("Community created successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "colored",
      });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      setTimeout(() => {
        navigate("/communities");
      }, 1000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    mutate({ name, description });
  };

  return (
    <>
      <div className="max-w-lg mx-auto mt-8 p-8 bg-gray-900 shadow-xl rounded-lg">
        <h2 className="text-4xl font-extrabold text-violet-600 text-center mb-6">
          Create a Community
        </h2>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-lg font-medium text-white">
              Community Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-5 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-gray-400"
              placeholder="Enter community name"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-white">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              required
              className="w-full px-5 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-gray-400"
              placeholder="Describe your community"
            />
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer py-3 mt-6 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 focus:outline-none"
            disabled={status === "pending"}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin border-4 border-t-4 border-white border-solid w-6 h-6 rounded-full"></div>
              </div>
            ) : (
              "Create Community"
            )}
          </button>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};
