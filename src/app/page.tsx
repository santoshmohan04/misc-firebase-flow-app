
"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth, useUser } from "@/firebase";
import {
  initiateEmailSignIn,
  initiateEmailSignUp,
} from "@/firebase/non-blocking-login";
import { useToast } from "@/hooks/use-toast";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function AuthenticationPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isUserLoading, router]);


  const onSignInSubmit: SubmitHandler<SignInFormValues> = (data) => {
    initiateEmailSignIn(auth, data.email, data.password, toast);
  };

  const onSignUpSubmit: SubmitHandler<SignUpFormValues> = (data) => {
    initiateEmailSignUp(auth, data.email, data.password, toast);
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex items-center justify-center rounded-full bg-primary p-3">
          <Flame className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          FirebaseFlow
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your all-in-one backend solution.
        </p>
      </div>

      <Tabs defaultValue="sign-in" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your email below to login to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...signInForm}>
                <form
                  onSubmit={signInForm.handleSubmit(onSignInSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="#"
                            className="ml-auto inline-block text-sm underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>
                Enter your information to create an account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...signUpForm}>
                <form
                  onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={signUpForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Max Robinson" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Create an account
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
