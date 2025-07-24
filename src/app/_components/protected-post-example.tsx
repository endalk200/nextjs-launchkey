"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function ProtectedPostExample() {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // Try to get current user - this will fail if not authenticated
  const { data: currentUser, error: userError } =
    api.post.getCurrentUser.useQuery();

  // Get protected posts - will fail if not authenticated
  const { data: posts, error: postsError } =
    api.post.getAllProtected.useQuery();

  const utils = api.useUtils();

  // Protected mutations
  const createProtectedPost = api.post.createProtected.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  const updateProtectedPost = api.post.updateProtected.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setEditingId(null);
      setEditName("");
    },
  });

  const deleteProtectedPost = api.post.deleteProtected.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
    },
  });

  // Handle authentication errors
  const isUnauthorized =
    userError?.data?.code === "UNAUTHORIZED" ||
    postsError?.data?.code === "UNAUTHORIZED";

  if (isUnauthorized) {
    return (
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-red-800">
          Authentication Required
        </h3>
        <p className="mb-4 text-red-600">
          You must be signed in to access protected features.
        </p>
        <a
          href="/signin"
          className="inline-block rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (!currentUser || !posts) {
    return (
      <div className="w-full max-w-md p-4">
        <p className="text-gray-600">Loading protected content...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* User Info */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="mb-2 text-lg font-semibold text-green-800">Welcome!</h3>
        <p className="text-green-700">
          Signed in as: <strong>{currentUser.name}</strong>
        </p>
        <p className="text-sm text-green-600">
          Email: {currentUser.email}
          {currentUser.emailVerified && " ✓"}
        </p>
      </div>

      {/* Create Protected Post */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-semibold">Create Protected Post</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) {
              createProtectedPost.mutate({ name: name.trim() });
            }
          }}
          className="space-y-3"
        >
          <input
            type="text"
            placeholder="Post title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={createProtectedPost.isPending || !name.trim()}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createProtectedPost.isPending
              ? "Creating..."
              : "Create Protected Post"}
          </button>
        </form>
      </div>

      {/* Protected Posts List */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-semibold">Protected Posts ({posts.length})</h4>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Create one above!</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="rounded bg-gray-50 p-3">
                {editingId === post.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editName.trim()) {
                        updateProtectedPost.mutate({
                          id: post.id,
                          name: editName.trim(),
                        });
                      }
                    }}
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded border px-2 py-1 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updateProtectedPost.isPending}
                        className="rounded bg-green-600 px-2 py-1 text-sm text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditName("");
                        }}
                        className="rounded bg-gray-600 px-2 py-1 text-sm text-white hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{post.name}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingId(post.id);
                          setEditName(post.name);
                        }}
                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          deleteProtectedPost.mutate({ id: post.id })
                        }
                        disabled={deleteProtectedPost.isPending}
                        className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
