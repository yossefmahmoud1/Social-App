import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Subabaseclient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../Context/AuthContext";

interface PostInput {
  title: string;
  content: string;
  community_id: number;
  author: string;
  avatar_url: string;
  user_id: string;
}

const createPost = async (post: PostInput, sefile: File) => {
  const sanitizeFileName = (name: string) =>
    name
      .normalize("NFD")
      .replace(/[^\u0300-\u036f]/g, "")
      .replace(/[^\w.-]/g, "-");

  const safeTitle = sanitizeFileName(post.title);
  const safeFileName = sanitizeFileName(sefile.name);
  const filePath = `${safeTitle}-${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("post-images")
    .upload(filePath, sefile);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl: url },
  } = await supabase.storage.from("post-images").getPublicUrl(filePath);

  const { data, error } = await supabase.from("Posts").insert({
    title: post.title,
    content: post.content,
    img_url: url,
    community_id: post.community_id,
    author: post.author,
    avatar_url: post.avatar_url,
    user_id: post.user_id,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [sefile, setSeFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch communities for dropdown
  const { data: communities } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data } = await supabase.from("communities").select("id, name");
      return data;
    },
  });

  const { mutate, status } = useMutation({
    mutationFn: (data: { post: PostInput; sefile: File }) =>
      createPost(data.post, data.sefile),
    onError: (err: any) => {
      toast.error(`Error: ${err.message}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "colored",
      });
    },
    onSuccess: () => {
      toast.success("Post added successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "colored",
      });
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    },
  });

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSeFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sefile) {
      toast.error("Please upload an image", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "colored",
      });
      return;
    }
    if (!communityId) {
      toast.error("Please select a community", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        theme: "colored",
      });
      return;
    }
    setLoading(true);
    mutate({
      post: {
        title,
        content,
        community_id: communityId,
        author: user?.user_metadata?.full_name || user?.email || "User",
        avatar_url: user?.user_metadata?.avatar_url || "",
        user_id: user?.id || "",
      },
      sefile,
    });
  };

  return (
    <>
      <div className="max-w-lg mx-auto mt-8 p-8 bg-gray-900 shadow-xl rounded-lg">
        <h2 className="text-4xl font-extrabold text-violet-600 text-center mb-6">
          Create a Post
        </h2>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-lg font-medium text-white">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-gray-400"
              placeholder="Enter post title"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-white">
              Content
            </label>
            <textarea
              name="content"
              id="content"
              rows={6}
              required
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-5 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-gray-400"
              placeholder="Write your post content"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-white">
              Select Community
            </label>
            <select
              required
              value={communityId ?? ""}
              onChange={(e) => setCommunityId(Number(e.target.value))}
              className="w-full px-5 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="">Select a community</option>
              {communities?.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-medium text-white">
              Upload Image
            </label>
            <input
              type="file"
              name="img"
              id="img"
              onChange={handleImgChange}
              accept="image/*"
              required
              className="w-full px-5 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            {preview && (
              <div className="mt-6">
                <p className="text-sm text-white">Image Preview:</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-4 w-60 h-auto rounded-md border-4 border-white"
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full  cursor-pointer py-3 mt-6 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 focus:outline-none"
            disabled={status === "pending"}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin border-4 border-t-4 border-white border-solid w-6 h-6 rounded-full  "></div>
              </div>
            ) : (
              "Add Post"
            )}
          </button>
        </form>
      </div>
      <ToastContainer />
    </>
  );
};

export default CreatePost;
