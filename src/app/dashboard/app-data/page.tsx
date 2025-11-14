'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

type Note = { id: string; [key: string]: any };
type Todo = { id: string; [key: string]: any };
type Conversation = { id: string; [key: string]: any };

export default function AppDataPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // Memoize collection references
  const notesRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/notes`) : null),
    [user, firestore]
  );
  const todosRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/todos`) : null),
    [user, firestore]
  );
  const conversationsRef = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/conversations`) : null),
    [user, firestore]
  );
  
  const conversationsQuery = useMemoFirebase(
    () => (conversationsRef ? query(conversationsRef, orderBy('createdAt', 'desc')) : null),
    [conversationsRef]
  );

  // Fetch data from collections
  const { data: notes, isLoading: isLoadingNotes, error: errorNotes } = useCollection<Note>(notesRef);
  const { data: todos, isLoading: isLoadingTodos, error: errorTodos } = useCollection<Todo>(todosRef);
  const { data: conversations, isLoading: isLoadingConversations, error: errorConversations } = useCollection<Conversation>(conversationsQuery);

  const combinedData = useMemo(() => {
    if (!user) return null;
    
    // Note: This shows collection data. For a complete picture, a recursive function
    // would be needed to fetch sub-collections like 'messages' for each conversation.
    return {
      userProfile: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        metadata: user.metadata,
      },
      collections: {
        notes: notes || [],
        todos: todos || [],
        conversations: conversations || [],
      },
    };
  }, [user, notes, todos, conversations]);

  const isLoading = isLoadingNotes || isLoadingTodos || isLoadingConversations;
  const error = errorNotes || errorTodos || errorConversations;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">App Data</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Raw Firestore Data</CardTitle>
          <CardDescription>
            A real-time JSON view of all data associated with your user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading your data...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Error fetching data: {error.message}</span>
            </div>
          )}
          {!isLoading && !error && (
            <pre className="mt-2 h-[60vh] w-full overflow-auto rounded-md bg-muted p-4 text-sm">
              {JSON.stringify(combinedData, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </>
  );
}
