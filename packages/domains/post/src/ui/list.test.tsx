import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PostList } from "./list.tsx";
import type { PostListPost } from "./types.ts";

const posts: ReadonlyArray<PostListPost> = [
	{
		id: "post-1",
		title: "First post",
		content: "First post body",
	},
	{
		id: "post-2",
		title: "Second post",
		content: "Second post body",
	},
];

function renderPostList({
	isLoading = false,
	isPending = false,
	items = posts,
	onCreatePost = vi.fn().mockResolvedValue(undefined),
	onUpdatePost = vi.fn().mockResolvedValue(undefined),
	onDeletePost = vi.fn().mockResolvedValue(undefined),
}: {
	isLoading?: boolean;
	isPending?: boolean;
	items?: ReadonlyArray<PostListPost>;
	onCreatePost?: (input: {
		title: string;
		content: string;
	}) => Promise<unknown>;
	onUpdatePost?: (input: {
		id: string;
		title: string;
		content: string;
	}) => Promise<unknown>;
	onDeletePost?: (id: string) => Promise<unknown>;
} = {}) {
	render(
		<PostList
			posts={items}
			isLoading={isLoading}
			isPending={isPending}
			onCreatePost={onCreatePost}
			onDeletePost={onDeletePost}
			onUpdatePost={onUpdatePost}
		/>,
	);

	return {
		onCreatePost,
		onDeletePost,
		onUpdatePost,
	};
}

describe("PostList", () => {
	it("renders a loading state", () => {
		renderPostList({ isLoading: true });

		expect(screen.getByText("Loading posts...")).toBeInTheDocument();
	});

	it("renders an empty state and opens the create form", () => {
		renderPostList({ items: [] });

		expect(screen.getByRole("heading", { name: "No posts yet" })).toBeVisible();

		fireEvent.click(
			screen.getAllByRole("button", { name: "New Post" }).at(-1)!,
		);

		expect(
			screen.getByRole("heading", { name: "Create Post" }),
		).toBeInTheDocument();
	});

	it("creates a post from the create form", async () => {
		const onCreatePost = vi.fn().mockResolvedValue(undefined);

		renderPostList({ onCreatePost });
		fireEvent.click(screen.getByRole("button", { name: "New Post" }));
		fireEvent.change(screen.getByPlaceholderText("Enter title"), {
			target: { value: "  New post  " },
		});
		fireEvent.change(
			screen.getByPlaceholderText("Write your content here..."),
			{
				target: { value: "  New body  " },
			},
		);
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => {
			expect(onCreatePost).toHaveBeenCalledWith({
				title: "New post",
				content: "New body",
			});
		});
		expect(screen.getByText("Showing 1 to 2 of 2 posts")).toBeInTheDocument();
	});

	it("opens a post detail view from the table", () => {
		renderPostList();

		fireEvent.click(screen.getByRole("button", { name: "First post" }));

		expect(
			screen.getByRole("heading", { name: "First post" }),
		).toBeInTheDocument();
		expect(screen.getByText("First post body")).toBeInTheDocument();
	});

	it("updates a post from the edit form", async () => {
		const onUpdatePost = vi.fn().mockResolvedValue(undefined);

		renderPostList({ onUpdatePost });
		const editButton = screen.getAllByRole("button", { name: "Edit" }).at(0);
		expect(editButton).toBeDefined();
		fireEvent.click(editButton as HTMLElement);
		fireEvent.change(screen.getByPlaceholderText("Enter title"), {
			target: { value: "Updated title" },
		});
		fireEvent.change(
			screen.getByPlaceholderText("Write your content here..."),
			{
				target: { value: "Updated body" },
			},
		);
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => {
			expect(onUpdatePost).toHaveBeenCalledWith({
				id: "post-1",
				title: "Updated title",
				content: "Updated body",
			});
		});
	});

	it("confirms deletion before deleting a post", async () => {
		const onDeletePost = vi.fn().mockResolvedValue(undefined);

		renderPostList({ onDeletePost });
		const deleteButton = screen
			.getAllByRole("button", { name: "Delete" })
			.at(0);
		expect(deleteButton).toBeDefined();
		fireEvent.click(deleteButton as HTMLElement);

		expect(
			screen.getByRole("heading", { name: "Delete Post" }),
		).toBeInTheDocument();

		fireEvent.click(screen.getAllByRole("button", { name: "Delete" }).at(-1)!);

		await waitFor(() => {
			expect(onDeletePost).toHaveBeenCalledWith("post-1");
		});
	});
});
