import { Button } from "@app/ui/components/button";
import { TableCell, TableRow } from "@app/ui/components/table";
import type { PostListPost } from "./types.ts";

export function PostListItem({
	post,
	onView,
	onEdit,
	onDelete,
}: {
	post: PostListPost;
	onView: () => void;
	onEdit: () => void;
	onDelete: () => void;
}) {
	return (
		<TableRow>
			<TableCell className="py-5 pr-4 font-medium">
				<button type="button" className="text-left" onClick={onView}>
					{post.title}
				</button>
			</TableCell>
			<TableCell className="w-[220px] py-5 text-right">
				<div className="inline-flex items-center gap-7 text-sm">
					<Button type="button" variant="ghost" size="sm" onClick={onView}>
						View
					</Button>
					<Button type="button" variant="ghost" size="sm" onClick={onEdit}>
						Edit
					</Button>
					<Button
						type="button"
						variant="destructive-ghost"
						size="sm"
						onClick={onDelete}
					>
						Delete
					</Button>
				</div>
			</TableCell>
		</TableRow>
	);
}
