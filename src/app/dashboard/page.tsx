import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const { user } = session;

  // Calculate account age
  const accountAge = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Status
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <Badge
              variant={user.emailVerified ? "default" : "secondary"}
              className="mt-1"
            >
              {user.emailVerified ? "Verified" : "Pending"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Age</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountAge}</div>
            <p className="text-muted-foreground text-xs">
              {accountAge === 1 ? "day" : "days"} old
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Secure</div>
            <p className="text-muted-foreground text-xs">Password protected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Login</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-muted-foreground text-xs">
              {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Profile Card */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full">
                <User className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{user.name}</h4>
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Member since</p>
                <p className="text-muted-foreground text-sm">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Email Status</p>
                <Badge variant={user.emailVerified ? "default" : "destructive"}>
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>

            <div className="pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/settings">
                <Shield className="mr-2 h-4 w-4" />
                Security Settings
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/settings">
                <Mail className="mr-2 h-4 w-4" />
                Email Preferences
              </Link>
            </Button>

            <div className="space-y-2 pt-4">
              <h4 className="text-sm font-semibold">Need Help?</h4>
              <p className="text-muted-foreground text-sm">
                Check out our documentation or contact support for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Application Features
          </CardTitle>
          <CardDescription>What you can do with NextCelerator</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold">Secure Authentication</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Built with Better Auth for enterprise-grade security and session
                management.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold">Modern Dashboard</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Clean, responsive interface built with shadcn/ui and Tailwind
                CSS.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold">Full-Stack Ready</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                T3 Stack with Next.js 15, tRPC, Prisma, and TypeScript.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
