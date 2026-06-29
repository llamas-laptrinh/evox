"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useProject } from "@/components/project-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Priority = "low" | "medium" | "high" | "urgent";

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

/**
 * Local task entry — replaces Linear for self-hosted setups.
 * Creates tasks directly via api.tasks.create; they appear on the dashboard in real time.
 */
export default function NewTaskPage() {
  const { selectedProjectId } = useProject();
  const projects = useQuery(api.projects.list);
  const agents = useQuery(api.agents.list);
  const recentTasks = useQuery(api.tasks.list, { limit: 8 });
  const createTask = useMutation(api.tasks.create);
  const { toast } = useToast();

  const projectId = selectedProjectId ?? projects?.[0]?._id ?? null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const fieldClass =
    "w-full rounded-md border border-border-default bg-surface-1 px-3 py-2 text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Missing title", description: "Task title is required.", variant: "destructive" });
      return;
    }
    if (!projectId) {
      toast({
        title: "No project found",
        description: "Run `npx convex run seed:seedDatabase` to create the default project.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createTask({
        agentName: "max",
        projectId: projectId as Id<"projects">,
        title: title.trim(),
        description: description.trim(),
        priority,
        assignee: assignee ? (assignee as Id<"agents">) : undefined,
      });
      toast({ title: "Task created", description: title.trim() });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignee("");
    } catch (err) {
      toast({
        title: "Failed to create task",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-base p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-white">New Task</h1>
            <p className="text-secondary">Add a task directly — no Linear required.</p>
          </div>
          <Link href="/dashboard" className="text-sm text-secondary hover:text-primary">
            ← Dashboard
          </Link>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border border-border-default bg-surface-1 p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, acceptance criteria, links…"
              rows={5}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={fieldClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee (optional)</Label>
              <select
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className={fieldClass}
              >
                <option value="">Unassigned</option>
                {agents?.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.avatar ? `${a.avatar} ` : ""}
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Task"}
            </Button>
          </div>
        </form>

        {/* Recently created */}
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary">
            Recent tasks
          </h2>
          <div className="space-y-2">
            {recentTasks === undefined && (
              <div className="text-secondary">Loading…</div>
            )}
            {recentTasks?.length === 0 && (
              <div className="text-secondary">No tasks yet — create the first one above.</div>
            )}
            {recentTasks?.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between rounded-md border border-border-default bg-surface-1 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-primary">{task.title}</div>
                  <div className="text-xs text-tertiary capitalize">
                    {task.status.replace("_", " ")}
                  </div>
                </div>
                <span className="ml-3 shrink-0 rounded-full border border-border-default px-2 py-0.5 text-xs capitalize text-secondary">
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
