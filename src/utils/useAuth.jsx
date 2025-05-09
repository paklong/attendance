import { useEffect, useState } from "react";
import { auth, getUserProfile } from "../utils/firebase";

export default function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          if (user.email === import.meta.env.VITE_admin_email) {
            setCurrentUser({ ...user, isAdmin: true });
          } else {
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setCurrentUser(null);
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { currentUser, setCurrentUser, userProfile, loading };
}
