"use client"; // Mark this component as a Client Component

import { useState } from "react";
import { Grid, List } from "lucide-react"; // Import icons from lucide-react
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Worker {
  id: string;
  name: string;
  type: string;
  hourlyRate: number;
  phoneNumber?: string;
  isActive: boolean;
}

interface ProjectWorkersProps {
  workers: {
    worker: Worker;
  }[];
  projectId: string;
}

export default function ProjectWorkers({ workers, projectId }: ProjectWorkersProps) {
  const [isListView, setIsListView] = useState(false); // State to toggle between views

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
        <p className="text-muted-foreground">View and manage workers assigned to this project</p>
        <div className="flex justify-end mb-4">
          <button
            className={`mr-2 p-2 rounded ${!isListView ? "stroke-2" : "stroke-4"}`}
            onClick={() => setIsListView(false)}
            aria-label="Grid View"
          >
            <Grid className={`h-5 w-5 ${!isListView ? "stroke-4" : "stroke-2"}`} />
          </button>
          <button
            className={`p-2 rounded ${isListView ? "stroke-2" : "stroke-4"}`}
            onClick={() => setIsListView(true)}
            aria-label="List View"
          >
            <List className={`h-5 w-5 ${isListView ? "stroke-4" : "stroke-2"}`} />
          </button>
        </div>
      </div>

      {isListView ? (
        <div className="space-y-4">
          {workers.map((assignment) => (
            <Link key={assignment.worker.id} href={`/workers/${assignment.worker.id}`}>
              <div className="flex items-center justify-between p-4 border rounded shadow hover:bg-muted/50 transition-colors">
                <div>
                  <h2 className="font-medium">{assignment.worker.name}</h2>
                  <p className="text-sm text-muted-foreground">{assignment.worker.type}</p>
                </div>
                <div>
                  <Badge variant={assignment.worker.isActive ? "default" : "secondary"}>
                    {assignment.worker.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workers.map((assignment) => (
            <Link key={assignment.worker.id} href={`/workers/${assignment.worker.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{assignment.worker.name}</CardTitle>
                      <CardDescription>{assignment.worker.type}</CardDescription>
                    </div>
                    <Badge variant={assignment.worker.isActive ? "default" : "secondary"}>
                      {assignment.worker.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Hourly Rate</dt>
                      <dd className="font-medium">₹{assignment.worker.hourlyRate}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Phone Number</dt>
                      <dd className="font-medium">{assignment.worker.phoneNumber || "Not provided"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 