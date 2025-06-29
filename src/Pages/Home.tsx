import React from "react";
import PostList from "../Components/PostList";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
            Welcome to Social App
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover amazing posts from our community. Share your thoughts,
            connect with others, and explore what's trending.
          </p>
        </div>

        {/* Recent Posts Section */}
        <div className="mb-8">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
              Recent Posts
            </h2>
            <div className="text-gray-400 text-sm text-center">
              Stay updated with the latest content
            </div>
          </div>

          {/* Posts List (centered column) */}
          <div className="flex flex-col items-center w-full">
            <PostList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
