import { PostListController } from "@app/post/client";

export default function Home() {
	return (
		<main className="min-h-screen bg-[#f7f7f8] px-4 py-10 text-[#17181c] sm:px-6">
			<section className="mx-auto w-full max-w-5xl">
				<PostListController />
			</section>
		</main>
	);
}
