import { PostListController } from "@app/post/client";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
	it("renders the posts demo inside the page container", () => {
		const page = Home();
		const section = page.props.children;

		expect(page.type).toBe("main");
		expect(page.props.className).toContain("min-h-screen");
		expect(section.type).toBe("section");
		expect(section.props.children.type).toBe(PostListController);
	});
});
