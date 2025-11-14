
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar as CalendarIcon, Database, RadioTower, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Todos } from "@/components/dashboard/todos";

type CardId = 'time' | 'date' | 'todos' | 'features';

const initialCardConfig: { id: CardId; component: React.FC; className: string }[] = [
  { id: 'time', component: TimeCard, className: 'lg:col-span-2' },
  { id: 'date', component: DateCard, className: 'lg:col-span-2' },
  { id: 'todos', component: Todos, className: 'lg:col-span-4' },
  { id: 'features', component: FeaturesCard, className: 'lg:col-span-3' },
];

// Sortable Card Wrapper
function SortableCard({ id, children, className }: { id: string; children: React.ReactNode; className: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <div className="relative h-full">
        <div {...attributes} {...listeners} className="absolute top-3 right-3 z-10 cursor-grab text-muted-foreground hover:text-foreground">
          <GripVertical className="h-5 w-5" />
        </div>
        {children}
      </div>
    </div>
  );
}

// Individual Card Components
function TimeCard() {
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Time</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{currentTime || "Loading..."}</div>
        <p className="text-xs text-muted-foreground">Updated every second</p>
      </CardContent>
    </Card>
  );
}

function DateCard() {
  const [currentDate, setCurrentDate] = useState("");
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Date</CardTitle>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{currentDate || "Loading..."}</div>
        <p className="text-xs text-muted-foreground">Your local date</p>
      </CardContent>
    </Card>
  );
}

function FeaturesCard() {
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Key Features</CardTitle>
        <CardDescription>Explore the core features of FirebaseFlow.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {features.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-muted p-2">{feature.icon}</div>
              <div>
                <p className="font-semibold">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
  const [cardConfig, setCardConfig] = useState(initialCardConfig);

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('dashboardCardOrder');
      if (savedOrder) {
        const parsedOrder: CardId[] = JSON.parse(savedOrder);
        const orderedConfig = parsedOrder
          .map(id => initialCardConfig.find(card => card.id === id))
          .filter((c): c is typeof initialCardConfig[0] => !!c);
        
        // Add any new cards that weren't in the saved order
        const newCards = initialCardConfig.filter(card => !parsedOrder.includes(card.id));
        setCardConfig([...orderedConfig, ...newCards]);

      }
    } catch (error) {
        console.error("Failed to parse card order from localStorage", error);
        setCardConfig(initialCardConfig);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCardConfig((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        try {
            localStorage.setItem('dashboardCardOrder', JSON.stringify(newOrder.map(item => item.id)));
        } catch (error) {
            console.error("Failed to save card order to localStorage", error);
        }

        return newOrder;
      });
    }
  }

  const cardIds = useMemo(() => cardConfig.map(c => c.id), [cardConfig]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cardIds} strategy={rectSortingStrategy}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {cardConfig.map(({ id, component: Component, className }) => (
              <SortableCard key={id} id={id} className={className}>
                 <Component />
              </SortableCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
