"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const eventTypes = ["USER_LOGIN", "DATA_UPDATE", "NEW_SUBSCRIPTION", "PAYMENT_SUCCESS"];
const users = ["Alice", "Bob", "Charlie", "Diana", "Edward"];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type EventLog = {
  id: number;
  timestamp: string;
  type: string;
  message: string;
};

export default function RealtimePage() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateInitialLogs = () => {
      const initialLogs: EventLog[] = [];
      for (let i = 0; i < 10; i++) {
        const type = getRandomItem(eventTypes);
        initialLogs.unshift({
          id: Date.now() + i,
          timestamp: new Date(Date.now() - i * 5000).toLocaleTimeString(),
          type: type,
          message: `User ${getRandomItem(users)} triggered ${type}`,
        });
      }
      setLogs(initialLogs);
    };
    generateInitialLogs();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prevLogs) => {
        const type = getRandomItem(eventTypes);
        const newLog: EventLog = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          type: type,
          message: `User ${getRandomItem(users)} triggered ${type}`,
        };
        return [newLog, ...prevLogs.slice(0, 49)];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">
          Real-time Database
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Event Stream</CardTitle>
          <CardDescription>
            This log simulates real-time data from your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4 font-mono text-sm">
            <div ref={scrollAreaRef}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="mb-2 flex items-center gap-4 transition-all"
                >
                  <span className="text-muted-foreground">
                    [{log.timestamp}]
                  </span>
                  <Badge
                    variant={
                      log.type.includes("LOGIN") || log.type.includes("SUCCESS")
                        ? "default"
                        : "secondary"
                    }
                    className={
                      log.type.includes("UPDATE")
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : ""
                    }
                  >
                    {log.type}
                  </Badge>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
