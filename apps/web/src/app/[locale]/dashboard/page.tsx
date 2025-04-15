"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { Loader2, User, Mail, Calendar } from "lucide-react";

// Updated type to match our component needs
type UserInfo = {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  notifications: boolean;
  notificationToken: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Type for the API response
type ApiUserResponse = {
  id: string;
  email: string;
  username: string | null;
  phone: string | null;
  firstName?: string | null;
  lastName?: string | null;
  first_name?: string | null; // DB mapping might use snake_case
  last_name?: string | null;  // DB mapping might use snake_case
  notifications: boolean;
  notificationToken: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Other possible fields
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
};

// Map API response to our UserInfo type
const mapApiResponseToUserInfo = (data: ApiUserResponse): UserInfo => {
  return {
    id: data.id,
    email: data.email,
    username: data.username,
    firstName: data.firstName || data.first_name || data.name || null,
    lastName: data.lastName || data.last_name || null,
    phone: data.phone,
    notifications: data.notifications,
    notificationToken: data.notificationToken,
    isDeleted: data.isDeleted,
    deletedAt: data.deletedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    name: data.name || null,
  };
};

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use tRPC hook to fetch user info
  api.user.getUserInfo.useQuery(undefined, {
    enabled: true,
    retry: 1,
    onSuccess: (data) => {
      if (data) {
        setUserInfo(mapApiResponseToUserInfo(data as unknown as ApiUserResponse));
      }
      setIsLoading(false);
    },
    onError: (err) => {
      setError(err.message || "Failed to fetch user information");
      setIsLoading(false);
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-red-50 p-6 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error || "Failed to load user data"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gray-50 p-4 pt-12">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Welcome, {userInfo?.name || userInfo?.username || "User"}
        </h1>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-primary-50 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Profile Information
            </h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">
                    {userInfo?.name || userInfo?.username || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{userInfo?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Member since
                  </p>
                  <p className="text-sm text-gray-900">
                    {userInfo?.createdAt
                      ? formatDate(userInfo.createdAt)
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/settings"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Edit Profile Settings
          </a>
        </div>
      </div>
    </div>
  );
}
