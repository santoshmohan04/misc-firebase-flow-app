
"use client";

import Link from "next/link";
import { ArrowRight, Bell, Database, RadioTower, Clock, Calendar as CalendarIcon, Plus, MoreHorizontal, Trash, Edit, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { listCalendarEvents, createCalendarEvent } from "@/ai/flows/calendar-flow";
import { useUser } from "@/firebase";

type GoogleCalendarEvent = {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string };
  end: { dateTime: string };
  organizer: { email: string, self: boolean };
  attendees?: { email: string, responseStatus: string }[];
};

export default function DashboardPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState({
    summary: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const token = sessionStorage.getItem('google-access-token');
    if (token) {
      setAccessToken(token);
    }

    const date = new Date();
    setCurrentDate(date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    setCurrentTime(date.toLocaleTimeString());

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const fetchEvents = async () => {
        if (!accessToken) return;
        setIsLoadingEvents(true);
        try {
            const fetchedEvents = await listCalendarEvents({ accessToken, maxResults: 10 });
            if (Array.isArray(fetchedEvents)) {
              setEvents(fetchedEvents);
            }
        } catch (error: any) {
            console.error(error);
            toast({ 
              title: "Error fetching calendar events", 
              description: error.message || "Could not fetch calendar events.", 
              variant: "destructive" 
            });
            if(error.message?.includes('token')){
              sessionStorage.removeItem('google-access-token');
              setAccessToken(null);
            }
        } finally {
            setIsLoadingEvents(false);
        }
    };

    fetchEvents();
  }, [accessToken, toast]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEventForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddEventClick = () => {
    const now = new Date();
    const start = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const end = new Date(now.getTime() - now.getTimezoneOffset() * 60000 + 3600000).toISOString().slice(0, 16);
    
    setEventForm({
      summary: "",
      description: "",
      startTime: start,
      endTime: end,
    });
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!accessToken || !eventForm.summary || !eventForm.startTime || !eventForm.endTime) {
      toast({ title: "Missing Information", description: "Please fill out all required fields.", variant: "destructive" });
      return;
    }
    
    try {
      const newEvent = await createCalendarEvent({
        accessToken,
        summary: eventForm.summary,
        description: eventForm.description,
        startTime: new Date(eventForm.startTime).toISOString(),
        endTime: new Date(eventForm.endTime).toISOString(),
      });
      if(newEvent) {
        setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()));
        toast({ title: "Success", description: "Event created successfully!" });
      }
    } catch(e: any) {
       toast({ title: "Error", description: e.message || "Failed to create event.", variant: "destructive" });
    }

    setIsDialogOpen(false);
  };

  const features = [
    {
      title: "Firestore Data",
      description: "Manage your app's data with our NoSQL database.",
      href: "/dashboard/firestore",
      icon: <Database className="h-6 w-6 text-primary" />,
    },
    {
      title: "AI Chat",
      description: "Talk to our real-time AI assistant.",
      href: "/dashboard/chat-history",
      icon: <RadioTower className="h-6 w-6 text-primary" />,
    },
  ];

  const formatEventTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>Your upcoming events.</CardDescription>
             </div>
             {accessToken && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={handleAddEventClick}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Event to Google Calendar</DialogTitle>
                      <DialogDescription>
                        Fill in the details for your new event.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="summary" className="text-right">Title</Label>
                        <Input id="summary" value={eventForm.summary} onChange={handleFormChange} className="col-span-3" />
                      </div>
                       <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">Description</Label>
                        <Textarea id="description" value={eventForm.description} onChange={handleFormChange} className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startTime" className="text-right">Start Time</Label>
                        <Input id="startTime" type="datetime-local" value={eventForm.startTime} onChange={handleFormChange} className="col-span-3" />
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endTime" className="text-right">End Time</Label>
                        <Input id="endTime" type="datetime-local" value={eventForm.endTime} onChange={handleFormChange} className="col-span-3" />
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
             )}
           </CardHeader>
           <CardContent>
              {!accessToken && user?.providerData.some(p => p.providerId === 'google.com') && (
                <div className="text-center text-muted-foreground">
                  <p>Please sign in again to grant calendar access.</p>
                </div>
              )}
               {!user?.providerData.some(p => p.providerId === 'google.com') && (
                <div className="text-center text-muted-foreground">
                  <p>Sign in with Google to view your calendar.</p>
                </div>
              )}
             {isLoadingEvents && <div className="flex justify-center items-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
             {!isLoadingEvents && events.map(event => (
               <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold">{formatEventTime(event.start.dateTime)} - {event.summary}</p>
                    {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                  </div>
               </div>
             ))}
             {!isLoadingEvents && accessToken && events.length === 0 && <p className="text-muted-foreground text-sm">No upcoming events found for today.</p>}
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
