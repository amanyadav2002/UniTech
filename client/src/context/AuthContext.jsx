import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and load user profile on app load
  // Initialize and load user profile on app load
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        // Don't log out on network issues, but stop loading
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);

      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up handler
  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register account");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);

      const registeredUser = data.user;
      if (registeredUser && registeredUser.role === "student") {
        const profile = registeredUser.profile || {};
        if (!profile.bookmarks) {
          profile.bookmarks = [];
        }
        registeredUser.profile = profile;
      }

      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Update Profile details handler
  const updateUserProfile = async (updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add a bookmark handler
  const addBookmark = async (bookmark) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/bookmarks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(bookmark),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add bookmark");
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  // Remove a bookmark handler
  const removeBookmark = async (itemId) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/auth/bookmarks/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove bookmark");
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    updateUserProfile,
    addBookmark,
    removeBookmark,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
