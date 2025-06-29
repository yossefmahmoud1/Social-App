import React, { createContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../Subabaseclient";

interface AuthContextType {
  user: User | null;
  signinWithGoogle: () => void;
  signOut: () => void;
  profilePicture: string | null;
  loading: boolean;
}
//const AuthContext = createContext();
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        handleProfilePicture(session.user);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          handleProfilePicture(session.user);
        } else {
          setUser(null);
          setProfilePicture(null);
        }
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleProfilePicture = async (user: User) => {
    if (!user) return;
    console.log("User metadata:", user.user_metadata);
    const pictureUrl = user.user_metadata?.picture;
    if (!pictureUrl) return;
    setProfilePicture(pictureUrl);
  };

  const signinWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid profile email",
        },
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      setUser(null);
      setProfilePicture(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, signinWithGoogle, signOut, profilePicture, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
