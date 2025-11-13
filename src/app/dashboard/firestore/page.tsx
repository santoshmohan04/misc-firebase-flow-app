"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const initialNotes: Note[] = [
  {
    id: "1",
    title: "Project Kickoff",
    content: "Initial meeting with the team to discuss project goals.",
    createdAt: new Date("2023-10-01T09:00:00Z").toLocaleDateString(),
  },
  {
    id: "2",
    title: "UI/UX Design",
    content: "Wireframing and prototyping session for the new dashboard.",
    createdAt: new Date("2023-10-05T14:30:00Z").toLocaleDateString(),
  },
  {
    id: "3",
    title: "Backend Development",
    content: "Setting up Firebase Authentication and Firestore rules.",
    createdAt: new Date("2023-10-10T11:00:00Z").toLocaleDateString(),
  },
];

export default function FirestorePage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const handleAddNote = () => {
    if (!newNoteTitle || !newNoteContent) return;
    const newNote: Note = {
      id: (notes.length + 1).toString(),
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: new Date().toLocaleDateString(),
    };
    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Firestore Data</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Note
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add a New Note</SheetTitle>
              <SheetDescription>
                Create a new note to store in your Firestore database.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="col-span-3"
                  rows={5}
                />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit" onClick={handleAddNote}>Save note</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes Collection</CardTitle>
          <CardDescription>
            A list of notes stored in your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="hidden md:table-cell">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.title}</TableCell>
                  <TableCell>{note.content}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {note.createdAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
