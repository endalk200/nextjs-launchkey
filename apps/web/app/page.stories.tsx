import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Home from "./page";

const meta = {
	title: "Web/Home",
	component: Home,
	parameters: {
		nextjs: {
			appDirectory: true,
		},
	},
} satisfies Meta<typeof Home>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
