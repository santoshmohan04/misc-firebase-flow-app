"use client";

import { useState } from "react";
import { Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  status: "Sent" | "Failed";
};

const initialNotifications: Notification[] = [
    { id: '1', title: 'Welcome!', message: 'Thanks for joining FirebaseFlow.', sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString(), status: 'Sent' },
    { id: '2', title: 'Feature Update', message: 'Real-time database is now 10% faster.', sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(), status: 'Sent' },
];

export default function NotificationsPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sentNotifications, setSentNotifications] = useState<Notification[]>(initialNotifications);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
        toast({
            title: "Error",
            description: "Please fill in both title and message.",
            variant: "destructive",
        });
        return;
    }

    const newNotification: Notification = {
      id: (sentNotifications.length + 1).toString(),
      title,
      message,
      sentAt: new Date().toLocaleString(),
      status: 'Sent'
    };

    setSentNotifications([newNotification, ...sentNotifications]);

    toast({
      title: `Notification Sent: ${title}`,
      description: message,
    });

    setTitle("");
    setMessage("");
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <h1 className="text-lg font-semibold md:text-2xl md:col-span-2">
          Cloud Messaging
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Compose Notification</CardTitle>
            <CardDescription>
              Send a push notification to your users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Your notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6 md:pt-[52px]">
        <Card>
          <CardHeader>
            <CardTitle>Sent Notifications</CardTitle>
            <CardDescription>History of sent notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentNotifications.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell className="font-medium">{notif.title}</TableCell>
                    <TableCell>
                      <Badge variant={notif.status === 'Sent' ? 'default' : 'destructive'}>{notif.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {notif.sentAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
