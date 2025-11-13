import Link from "next/link";
import { ArrowRight, Bell, Database, RadioTower } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";

const chartData = [
  { month: "January", requests: 186 },
  { month: "February", requests: 305 },
  { month: "March", requests: 237 },
  { month: "April", requests: 273 },
  { month: "May", requests: 209 },
  { month: "June", requests: 214 },
];

const chartConfig = {
  requests: {
    label: "API Requests",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const features = [
    {
      title: "Firestore Data",
      description: "Manage your app's data with our NoSQL database.",
      href: "/dashboard/firestore",
      icon: <Database className="h-6 w-6 text-primary" />,
    },
    {
      title: "Real-time Updates",
      description: "Sync data across clients in real-time.",
      href: "/dashboard/realtime",
      icon: <RadioTower className="h-6 w-6 text-primary" />,
    },
    {
      title: "Push Notifications",
      description: "Engage your users with targeted notifications.",
      href: "/dashboard/notifications",
      icon: <Bell className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {feature.title}
              </CardTitle>
              {feature.icon}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              <Link href={feature.href} className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Go to {feature.title.split(" ")[0]}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>
            Showing API requests for the last 6 months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="requests" fill="var(--color-requests)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
