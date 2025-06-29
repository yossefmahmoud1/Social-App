import "./App.css";
import React, { ReactNode } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import NavBar from "./Components/NavBar";
import CreatePostPage from "./Pages/CreatePostPage";
import { CommunitiesPage } from "./Pages/CommunitiesPage";
import { CommunityPage } from "./Pages/CommunityPage";
import { CreateCommunityPage } from "./Pages/CreateCommunityPage";
import { PostPage } from "./Pages/PostPage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import { AuthProvider, useAuth } from "./Context/AuthContext";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-black text-gray-100 transition-opacity duration-700 pt-20">
        <NavBar />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/create" element={<CreatePostPage />} />
                    <Route path="/communities" element={<CommunitiesPage />} />
                    <Route
                      path="/community/create"
                      element={<CreateCommunityPage />}
                    />
                    <Route path="/community/:id" element={<CommunityPage />} />
                    <Route path="/post/:id" element={<PostPage />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
