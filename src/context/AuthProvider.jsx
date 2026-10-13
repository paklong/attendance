import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  getUserProfile,
  isAdminEmail,
  subscribeToAuthChanges,
} from "../services/authService";

const SIGNED_OUT = {
  currentUser: null,
  userProfile: null,
  isAdmin: false,
  loading: false,
};

export default function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({ ...SIGNED_OUT, loading: true });

  useEffect(() => {
    let latestChange = 0;

    return subscribeToAuthChanges(async (user) => {
      const changeId = ++latestChange;
      if (!user) {
        setAuthState(SIGNED_OUT);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.uid);
        if (changeId !== latestChange) return;
        setAuthState({
          currentUser: user,
          userProfile,
          isAdmin: isAdminEmail(user.email),
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (changeId === latestChange) setAuthState(SIGNED_OUT);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}
