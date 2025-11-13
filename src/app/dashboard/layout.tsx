"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bell,
  Database,
  Flame,
  Home,
  LogOut,
  Menu,
  RadioTower,
  User,
} from "lucide-react";
import { useEffect } from "react";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useAuth, useUser } from "@/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const avatarPlaceholder = PlaceHolderImages.find((img) => img.id === "user-avatar");

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    auth.signOut();
  };
  
  const getAvatar = () => {
    if (user?.photoURL) {
      return {
        imageUrl: user.photoURL,
        description: user.displayName || 'User avatar',
        imageHint: 'person portrait'
      }
    }
    return avatarPlaceholder;
  }
  
  const avatar = getAvatar();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/firestore", icon: Database, label: "Firestore" },
    { href: "/dashboard/realtime", icon: RadioTower, label: "Real-time" },
    {
      href: "/dashboard/notifications",
      icon: Bell,
      label: "Notifications",
    },
  ];

  const NavLinks = ({
    isMobile = false,
  }: {
    isMobile?: boolean;
  }) => (
    <nav
      className={`grid items-start px-2 text-sm font-medium ${
        isMobile ? "gap-4" : "gap-2 lg:px-4"
      }`}
    >
      {navItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            pathname === href
              ? "bg-muted text-primary"
              : "text-muted-foreground"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
  
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Flame className="h-6 w-6 text-primary" />
              <span className="">FirebaseFlow</span>
            </Link>
          </div>
          <div className="flex-1">
            <NavLinks />
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Check our documentation for more info.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Link href="#">
                  <Button size="sm" className="w-full">
                    Documentation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold"
                >
                  <Flame className="h-6 w-6 text-primary" />
                  <span className="">FirebaseFlow</span>
                </Link>
              </div>
              <NavLinks isMobile />
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                    <CardDescription>
                      Check our documentation for more info.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="#">
                      <Button size="sm" className="w-full">
                        Documentation
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add a search bar here if needed */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                {avatar && (
                  <Image
                    src={avatar.imageUrl}
                    width={40}
                    height={40}
                    alt={avatar.description}
                    className="rounded-full"
                    data-ai-hint={avatar.imageHint}
                  />
                )}
                {!avatar && <User className="h-5 w-5" />}
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/dashboard/profile" passHref>
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </Link>
              <Link href="/dashboard/settings" passHref>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
