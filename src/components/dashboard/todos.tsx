
"use client";

import React, { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash, MoreHorizontal, Info, CheckSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type Todo = {
  id: string;
  task: string;
  completed: boolean;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
};

export function Todos() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [newTask, setNewTask] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const todosCollectionRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'todos') : null),
    [user, firestore]
  );
  
  const { data: todos, isLoading } = useCollection<Todo>(todosCollectionRef);

  const handleAddTodo = () => {
    if (!todosCollectionRef || !newTask.trim()) return;

    const newTodo = {
      task: newTask.trim(),
      completed: false,
      createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(todosCollectionRef, newTodo);
    setNewTask('');
    setIsAdding(false);
  };

  const handleToggleTodo = (todo: Todo) => {
    if (!todosCollectionRef) return;
    const todoDocRef = doc(todosCollectionRef, todo.id);
    updateDocumentNonBlocking(todoDocRef, { completed: !todo.completed });
  };

  const handleDeleteTodo = (todoId: string) => {
    if (!todosCollectionRef) return;
    const todoDocRef = doc(todosCollectionRef, todoId);
    deleteDocumentNonBlocking(todoDocRef);
  };

  const handleClearCompleted = () => {
    if (!todos || !todosCollectionRef) return;
    const completedTodos = todos.filter(todo => todo.completed);
    completedTodos.forEach(todo => {
        const todoDocRef = doc(todosCollectionRef, todo.id);
        deleteDocumentNonBlocking(todoDocRef);
    });
  };

  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <CardTitle>To-dos</CardTitle>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Your to-do items are stored in Firestore.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClearCompleted} disabled={!todos?.some(t => t.completed)}>
                    Clear completed
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
            {isAdding ? (
                 <div className="flex items-center gap-2">
                    <Input 
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                        placeholder="What needs to be done?"
                        autoFocus
                    />
                    <Button onClick={handleAddTodo} size="sm">Add</Button>
                    <Button onClick={() => setIsAdding(false)} size="sm" variant="ghost">Cancel</Button>
                 </div>
            ) : (
                <Button variant="ghost" onClick={() => setIsAdding(true)} className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                    <PlusCircle className="h-4 w-4" />
                    Add to-do
                </Button>
            )}
        </div>

        {isLoading && <p className="text-muted-foreground text-center">Loading to-dos...</p>}

        {!isLoading && (!todos || todos.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
                <CheckSquare className="mx-auto h-12 w-12" />
                <p className="mt-4">You have nothing to-do. Try adding something above.</p>
            </div>
        )}

        {!isLoading && todos && todos.length > 0 && (
            <div className="space-y-2">
                {todos.sort((a, b) => (a.completed ? 1 : -1)).map(todo => (
                    <div key={todo.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted group">
                        <Checkbox 
                            id={`todo-${todo.id}`}
                            checked={todo.completed}
                            onCheckedChange={() => handleToggleTodo(todo)}
                        />
                        <label 
                            htmlFor={`todo-${todo.id}`}
                            className={`flex-1 text-sm cursor-pointer ${todo.completed ? 'text-muted-foreground line-through' : ''}`}
                        >
                            {todo.task}
                        </label>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteTodo(todo.id)}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        )}

      </CardContent>
    </Card>
  );
}
