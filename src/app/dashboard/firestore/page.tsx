"use client";

import { useState } from "react";
import { PlusCircle, MoreHorizontal, Edit, Trash } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
};

export default function FirestorePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const notesCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, "users", user.uid, "notes") : null),
    [user, firestore]
  );
  const { data: notes, isLoading } = useCollection<Note>(notesCollectionRef);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });


  const handleAddNoteClick = () => {
    setEditingNote(null);
    setNoteForm({ title: "", content: "" });
    setIsSheetOpen(true);
  };

  const handleEditNoteClick = (note: Note) => {
    setEditingNote(note);
    setNoteForm({ title: note.title, content: note.content });
    setIsSheetOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!notesCollectionRef) return;
    const noteDocRef = doc(notesCollectionRef, noteId);
    deleteDocumentNonBlocking(noteDocRef);
  };

  const handleSaveNote = () => {
    if (!notesCollectionRef || !noteForm.title || !noteForm.content) return;

    if (editingNote) {
      // Update existing note
      const noteDocRef = doc(notesCollectionRef, editingNote.id);
      updateDocumentNonBlocking(noteDocRef, {
        title: noteForm.title,
        content: noteForm.content,
      });
    } else {
      // Add new note
      const newNote = {
        title: noteForm.title,
        content: noteForm.content,
        createdAt: serverTimestamp(),
      };
      addDocumentNonBlocking(notesCollectionRef, newNote);
    }

    setIsSheetOpen(false);
    setEditingNote(null);
    setNoteForm({ title: "", content: "" });
  };


  const formatDate = (timestamp: Note['createdAt']) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Firestore Data</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-1" onClick={handleAddNoteClick}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Note
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingNote ? "Edit Note" : "Add a New Note"}</SheetTitle>
              <SheetDescription>
                {editingNote ? "Update the details of your note." : "Create a new note to store in your Firestore database."}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                  className="col-span-3"
                  rows={5}
                />
              </div>
            </div>
            <SheetFooter>
                <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                <Button type="submit" onClick={handleSaveNote}>
                  Save note
                </Button>
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
          {isLoading && <p>Loading notes...</p>}
          {!isLoading && (!notes || notes.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
                You haven&apos;t added any notes yet.
            </div>
          )}
          {!isLoading && notes && notes.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created At
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.title}</TableCell>
                    <TableCell>{note.content}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(note.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditNoteClick(note)}>
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
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your note.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteNote(note.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
