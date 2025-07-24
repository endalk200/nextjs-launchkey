import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="from-background to-secondary/20 min-h-screen bg-gradient-to-b">
      {/* Navigation */}
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary h-8 w-8 rounded-full"></div>
            <span className="text-xl font-bold">NextCelerator</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <Badge variant="outline" className="mb-4">
          🚀 Built with T3 Stack + Better Auth
        </Badge>
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Accelerate Your Next.js
          <span className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-transparent">
            {" "}
            Development
          </span>
        </h1>
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
          A powerful starter template with Next.js 15, tRPC, Prisma, TypeScript,
          and Better Auth. Everything you need to build modern web applications
          with authentication built-in.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Start Building <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Built with modern technologies and best practices for rapid
            development
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Shield className="text-primary mb-2 h-8 w-8" />
              <CardTitle>Secure Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in email/password authentication with Better Auth. Session
                management, middleware protection, and more.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="text-primary mb-2 h-8 w-8" />
              <CardTitle>Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Next.js 15 with App Router, React 19, tRPC for type-safe APIs,
                and Tailwind CSS for beautiful styling.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="text-primary mb-2 h-8 w-8" />
              <CardTitle>Developer Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Full TypeScript support, Prisma ORM, ESLint, Prettier, and hot
                reload for the best development experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-primary/10 rounded-lg p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of developers building amazing applications with
            NextCelerator.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="text-muted-foreground mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p>&copy; 2024 NextCelerator. Built with ❤️ using the T3 Stack.</p>
        </div>
      </footer>
    </div>
  );
}
