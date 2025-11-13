"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User as UserIcon, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { cn } from "@/lib/utils";
import { chat } from "@/ai/flows/chat-flow";
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useCollection } from "@/firebase/firestore/use-collection";
import Link from "next/link";

type Message = {
  id?: string;
  role: "user" | "bot";
  content: string;
  timestamp?: any;
};

export default function RealtimePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const conversationId = "main-chat"; // For now, we'll use a single conversation

  const messagesRef = useMemoFirebase(
    () => user ? collection(firestore, `users/${user.uid}/conversations/${conversationId}/messages`) : null,
    [user, firestore]
  );
  
  const messagesQuery = useMemoFirebase(
      () => messagesRef ? query(messagesRef, orderBy("timestamp", "asc")) : null,
      [messagesRef]
  );

  const { data: savedMessages, isLoading: isLoadingHistory } = useCollection<Message>(messagesQuery);


  useEffect(() => {
    if (savedMessages) {
        // Add initial bot greeting if no history exists
        if (savedMessages.length === 0) {
             const greeting = {
                role: "bot" as const,
                content: `Hello, ${user?.displayName || 'there'}! Welcome to the chat. You can ask me for the current date, time, or other basic info.`,
            };
            setMessages([greeting]);
        } else {
            setMessages(savedMessages);
        }
    } else if (!isLoadingHistory) {
         const greeting = {
            role: "bot" as const,
            content: `Hello, ${user?.displayName || 'there'}! Welcome to the chat. You can ask me for the current date, time, or other basic info.`,
        };
        setMessages([greeting]);
    }
  }, [savedMessages, isLoadingHistory, user]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !messagesRef) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: serverTimestamp(),
    };
    
    setMessages((prev) => [...prev, {role: "user", content: input}]);
    await addDoc(messagesRef, userMessage);

    setInput("");
    setIsLoading(true);

    try {
      const botResponseContent = await chat(input);
      const botMessage: Message = {
        role: "bot",
        content: botResponseContent,
        timestamp: serverTimestamp(),
      };
      await addDoc(messagesRef, botMessage);
      // The useCollection hook will update the messages state automatically
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        role: "bot",
        content: "Sorry, I'm having trouble connecting to my brain right now.",
        timestamp: serverTimestamp(),
      };
       await addDoc(messagesRef, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What time is it?",
    "What is the date today?",
    "What is Firebase?",
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">AI Chat</h1>
        <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/chat-history">Conversation History</Link>
        </Button>
      </div>
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot /> Real-time AI Assistant
          </CardTitle>
          <CardDescription>
            This is a real-time chat interface powered by a Genkit AI flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {isLoadingHistory && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === "user" ? "justify-end" : ""
                  )}
                >
                  {message.role === "bot" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg p-3 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p>{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-muted rounded-lg p-3 text-sm">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
           {messages.length <= 1 && !isLoading && (
                <div className="p-6 pt-0">
                    <p className="text-sm text-muted-foreground mb-2">Suggested prompts:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map(q => (
                            <Button key={q} variant="outline" size="sm" onClick={() => setInput(q)}>
                               <Sparkles className="h-3 w-3 mr-2" /> {q}
                            </Button>
                        ))}
                    </div>
                </div>
           )}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
