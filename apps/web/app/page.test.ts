import { PostListController } from "@app/post/client";
import { describe, expect, it, vi } from "vitest";
import { HomeView } from "./home-view";
import Home from "./page";

vi.mock("./session", () => ({
	getServerSession: async () => ({
		user: {
			email: "user@example.com",
		},
	}),
}));

describe("Home", () => {
	it("renders the authenticated posts page", async () => {
		const page = await Home();

		expect(page.type).toBe(HomeView);
		expect(page.props.email).toBe("user@example.com");
	});

	it("renders the authenticated posts view", () => {
		const page = HomeView({ email: "user@example.com" });
		const section = page.props.children;
		const [header, controller] = section.props.children;

		expect(page.type).toBe("main");
		expect(page.props.className).toContain("min-h-screen");
		expect(section.type).toBe("section");
		expect(header.type).toBe("header");
		expect(controller.type).toBe(PostListController);
	});
});
