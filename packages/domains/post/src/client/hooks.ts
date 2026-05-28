"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disposePostRpc, postRpc } from "./rpc-client.ts";

const postsQueryKey = ["posts"] as const;

if (typeof window !== "undefined") {
	window.addEventListener("pagehide", () => void disposePostRpc(), {
		once: true,
	});
}

export function usePosts() {
	return useQuery({
		queryKey: postsQueryKey,
		queryFn: postRpc.list,
	});
}

export function useCreatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { title: string; content: string }) =>
			postRpc.create(input.title, input.content),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: postsQueryKey }),
	});
}

export function useUpdatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { id: string; title: string; content: string }) =>
			postRpc.update(input.id, input.title, input.content),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: postsQueryKey }),
	});
}

export function useDeletePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => postRpc.delete(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: postsQueryKey }),
	});
}
