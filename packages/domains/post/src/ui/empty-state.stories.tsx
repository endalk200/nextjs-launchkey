import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PostEmptyState } from "./empty-state.js";
import { PostListLoading } from "./loading.js";

const meta = {
	title: "Post/EmptyState",
	component: PostEmptyState,
	tags: ["autodocs"],
	args: {
		onCreate: () => undefined,
	},
} satisfies Meta<typeof PostEmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty = {} satisfies Story;

export const Loading = {
	render: () => <PostListLoading />,
} satisfies Story;
