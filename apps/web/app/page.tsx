import { Button } from "@app/ui/components/button";

export default function Home() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
			<section className="flex w-full max-w-xl flex-col gap-6">
				<div className="flex flex-col gap-2">
					<p className="text-sm font-medium text-muted-foreground">shadcn/ui</p>
					<h1 className="text-3xl font-semibold tracking-normal">
						Shared button component
					</h1>
					<p className="text-muted-foreground">
						Rendered from the new monorepo UI package.
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Button>Default</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
				</div>
			</section>
		</main>
	);
}
