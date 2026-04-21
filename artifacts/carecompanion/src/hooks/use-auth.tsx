import { useState, useEffect } from "react";

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("carecompanion_user_id");
    if (storedUserId) {
      setUserId(storedUserId);
    }
    setIsLoading(false);
  }, []);

  const login = (id: string) => {
    localStorage.setItem("carecompanion_user_id", id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem("carecompanion_user_id");
    setUserId(null);
  };

  return { userId, login, logout, isLoading };
}
