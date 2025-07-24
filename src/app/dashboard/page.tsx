import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar } from "lucide-react";
import { SignOutButton } from "../_components/sign-out-button";
import { ProtectedPostExample } from "../_components/protected-post-example";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const { user } = session;

  return (
    <div className="from-background to-secondary/20 min-h-screen bg-gradient-to-b">
      {/* Navigation */}
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary h-8 w-8 rounded-full"></div>
            <span className="text-xl font-bold">NextCelerator</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground text-sm">
              Welcome, {user.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your personal dashboard. Manage your account and explore
            features.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-2">
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? "Email Verified" : "Email Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Email Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Activity
              </Button>
            </CardContent>
          </Card>

          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Welcome to NextCelerator!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                You&apos;ve successfully set up authentication with Better Auth.
                This dashboard demonstrates protected routes and session
                management.
              </p>
              <div className="space-y-2">
                <Badge variant="outline">✅ Authentication</Badge>
                <Badge variant="outline">✅ Session Management</Badge>
                <Badge variant="outline">✅ Route Protection</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Content Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Application Features</CardTitle>
              <CardDescription>
                This dashboard showcases the T3 stack with Better Auth
                integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">🔐 Authentication Features</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Email/Password authentication</li>
                    <li>• Session management with cookies</li>
                    <li>• Route protection middleware</li>
                    <li>• Secure logout functionality</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">🚀 Tech Stack</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Next.js 15 with App Router</li>
                    <li>• Better Auth for authentication</li>
                    <li>• Prisma ORM with PostgreSQL</li>
                    <li>• Tailwind CSS for styling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <ProtectedPostExample />
        </div>
      </main>
    </div>
  );
}
