
"use client";

import { useState } from "react";
import { MessageSquare, MoreHorizontal, Edit, Trash, PlusCircle } from "lucide-react";
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
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, deleteDoc, doc, serverTimestamp, addDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";


type Conversation = {
  id: string;
  title: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
  userId: string;
};

export default function ChatHistoryPage() {
  const { user } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const conversationsCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, "users", user.uid, "conversations") : null),
    [user, firestore]
  );
  const { data: conversations, isLoading } = useCollection<Conversation>(conversationsCollectionRef);

  const handleDeleteConversation = async (conversationId: string) => {
    if (!conversationsCollectionRef) return;
    // Note: This only deletes the conversation document. For a production app,
    // a cloud function would be needed to delete the subcollection of messages.
    await deleteDoc(doc(conversationsCollectionRef, conversationId));
  };
  
  const handleNewConversation = async () => {
    if (!conversationsCollectionRef || !user) return;
    
    const newConversation = {
      title: `New Conversation ${new Date().toLocaleString()}`,
      createdAt: serverTimestamp(),
      userId: user.uid,
    };
    const docRef = await addDoc(conversationsCollectionRef, newConversation);
    router.push(`/dashboard/realtime?conversationId=${docRef.id}`);
  }

  const formatDate = (timestamp: Conversation['createdAt']) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Chat History</h1>
         <Button size="sm" className="gap-1" onClick={handleNewConversation}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Chat
              </span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Conversations</CardTitle>
          <CardDescription>
            A list of all your past chat sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading history...</p>}
          {!isLoading && (!conversations || conversations.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="mx-auto h-12 w-12" />
                <p className="mt-4">You don&apos;t have any saved conversations yet.</p>
                 <Button onClick={handleNewConversation} className="mt-4">
                    Start a new Chat
                </Button>
            </div>
          )}
          {!isLoading && conversations && conversations.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created At
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((convo) => (
                  <TableRow key={convo.id}>
                    <TableCell className="font-medium">{convo.title}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(convo.createdAt)}
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
                           <DropdownMenuItem asChild>
                            <Link href={`/dashboard/realtime?conversationId=${convo.id}`} className="flex items-center w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                View/Edit
                            </Link>
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
                                  This action cannot be undone. This will permanently delete your conversation document, but not the messages within it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteConversation(convo.id)}
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
