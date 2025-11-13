
"use client";

import Link from "next/link";
import { ArrowRight, Bell, Database, RadioTower, Clock, Calendar as CalendarIcon, Plus, MoreHorizontal, Trash, Edit } from "lucide-react";
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
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

type Event = {
  id: number;
  time: string;
  title: string;
  category: string;
};

const initialEvents: Event[] = [
  {
    id: 1,
    time: "10:00 AM",
    title: "Team Standup",
    category: "Work",
  },
  {
    id: 2,
    time: "12:30 PM",
    title: "Lunch with Sarah",
    category: "Personal",
  },
  {
    id: 3,
    time: "2:00 PM",
    title: "Project Alpha Kick-off",
    category: "Work",
  },
  {
    id: 4,
    time: "6:00 PM",
    title: "Gym Session",
    category: "Health",
  },
];

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [eventForm, setEventForm] = useState({
    time: "",
    title: "",
    category: "",
  });

  useEffect(() => {
    const date = new Date();
    setCurrentDate(date.toLocaleDateString());
    setCurrentTime(date.toLocaleTimeString());

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEventForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ time: "", title: "", category: "" });
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      time: event.time,
      title: event.title,
      category: event.category,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: number) => {
    setEvents(events.filter((event) => event.id !== eventId));
  };

  const handleSaveEvent = () => {
    if (editingEvent) {
      // Update existing event
      setEvents(
        events.map((event) =>
          event.id === editingEvent.id
            ? { ...event, ...eventForm }
            : event
        )
      );
    } else {
      // Add new event
      const newEvent: Event = {
        id: Date.now(),
        ...eventForm,
      };
      setEvents([...events, newEvent]);
    }
    setIsDialogOpen(false);
    setEditingEvent(null);
  };

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTime || "Loading..."}</div>
            <p className="text-xs text-muted-foreground">Updated every second</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Date</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentDate || "Loading..."}</div>
            <p className="text-xs text-muted-foreground">Your local date</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2">
           <CardHeader className="flex flex-row items-center justify-between">
             <div>
                <CardTitle>Calendar & Events</CardTitle>
                <CardDescription>Your schedule for today.</CardDescription>
             </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={handleAddEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                    <DialogDescription>
                      {editingEvent ? 'Update the details for your event.' : 'Fill in the details for your new event.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="time" className="text-right">Time</Label>
                      <Input id="time" value={eventForm.time} onChange={handleFormChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input id="title" value={eventForm.title} onChange={handleFormChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Category</Label>
                      <Input id="category" value={eventForm.category} onChange={handleFormChange} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveEvent}>Save Event</Button>
                  </DialogFooter>
                </DialogContent>
             </Dialog>
           </CardHeader>
           <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
             </div>
             <div className="space-y-4">
                <h3 className="font-semibold text-md">Upcoming Events</h3>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="text-sm text-muted-foreground">{event.time}</div>
                            <div className="flex flex-col">
                                <span className="font-medium">{event.title}</span>
                                <Badge variant="secondary" className="w-fit mt-1">{event.category}</Badge>
                            </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <Trash className="mr-2 h-4 w-4 text-destructive" />
                                        <span className="text-destructive">Delete</span>
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your event.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  ))}
                </div>
             </div>
           </CardContent>
        </Card>
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

    