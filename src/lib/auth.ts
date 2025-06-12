import supabase from "./supabase";
import type {
  User,
  AuthResponse,
  UserResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
}

interface UserProfile {
  id: string;
  full_name: string;
}

// Login function
export const login = async ({ email, password }: LoginCredentials) => {
  const { data, error }: AuthResponse = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    const user: User = data.user;

    const {
      data: profileData,
      error: profileError,
    }: PostgrestSingleResponse<UserProfile> = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.warn("Could not fetch profile:", profileError.message);
    }

    return { user: user, profile: profileData };
  } else {
    throw new Error("Login successful, but user data is missing.");
  }
};

// Register function
export const register = async ({
  email,
  password,
  fullName,
}: RegisterCredentials) => {
  const { data, error }: AuthResponse = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Logout function
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

// Get current user
export const getCurrentUser = async () => {
  const { data, error }: UserResponse = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
};
