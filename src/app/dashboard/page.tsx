
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
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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

type Event = {
  id: number;
  time: string;
  title: string;
  category: string;
};

const initialEvents: Event[] = [
  {
    id: 1,
    time: "10:00",
    title: "Team Standup",
    category: "Work",
  },
  {
    id: 2,
    time: "12:30",
    title: "Lunch with Sarah",
    category: "Personal",
  },
  {
    id: 3,
    time: "14:00",
    title: "Project Alpha Kick-off",
    category: "Work",
  },
  {
    id: 4,
    time: "18:00",
    title: "Gym Session",
    category: "Health",
  },
];

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
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
  ];

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes.padStart(2, '0')} ${ampm}`;
  };

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
                      <Input id="time" type="time" value={eventForm.time} onChange={handleFormChange} className="col-span-3" />
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
                    <Button onClick={handleSaveEvent}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
           </CardHeader>
           <CardContent>
             {events.sort((a,b) => a.time.localeCompare(b.time)).map(event => (
               <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold">{formatTime(event.time)} - {event.title}</p>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                             <Trash className="mr-2 h-4 w-4" />
                             Delete
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this event.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
             ))}
             {events.length === 0 && <p className="text-muted-foreground text-sm">No events scheduled for today.</p>}
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>
              Explore the core features of FirebaseFlow.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-muted p-2">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
