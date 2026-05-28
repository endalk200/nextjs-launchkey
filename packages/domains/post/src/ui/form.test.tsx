import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PostForm } from "./form.tsx";

describe("PostForm", () => {
	it("renders create mode", () => {
		render(
			<PostForm
				initialValue={{ title: "", content: "" }}
				isEditing={false}
				isPending={false}
				onCancel={vi.fn()}
				onSubmit={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: "Create Post" }),
		).toBeInTheDocument();

		fireEvent.change(screen.getByPlaceholderText("Enter title"), {
			target: { value: "Draft" },
		});

		expect(screen.getByDisplayValue("Draft")).toBeInTheDocument();
	});

	it("renders edit mode and disables save while pending", () => {
		render(
			<PostForm
				initialValue={{ title: "Existing", content: "Body" }}
				isEditing
				isPending
				onCancel={vi.fn()}
				onSubmit={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Edit Post" })).toBeVisible();
		expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
	});
});
