import { PostApi } from "@app/post/api";
import { HttpApiScalar } from "effect/unstable/httpapi";

export const PostApiDocumentation = HttpApiScalar.layer(PostApi, {
	path: "/api/docs",
	scalar: {
		defaultOpenAllTags: true,
		layout: "modern",
		showOperationId: true,
		showSidebar: true,
	},
});
