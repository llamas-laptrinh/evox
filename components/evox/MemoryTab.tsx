"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { WorkingMemoryPanel } from "./WorkingMemoryPanel";
import { DailyNotesList } from "./DailyNotesList";
import { SoulPreview } from "./SoulPreview";

interface MemoryTabProps {
  agentId: Id<"agents">;
  agentName: string;
  className?: string;
}

/**
 * AGT-113: Memory tab container — WORKING.md, Daily Notes, SOUL preview
 */
export function MemoryTab({ agentId, className }: MemoryTabProps) {
  // Fetch memory data
  const soulMemory = useQuery(api.agentMemory.getMemory, {
    agentId,
    type: "soul",
  });
  const workingMemory = useQuery(api.agentMemory.getMemory, {
    agentId,
    type: "working",
  });
  const dailyNotes = useQuery(api.agentMemory.listDailyNotes, {
    agentId,
    limit: 30,
  });

  const isLoading = soulMemory === undefined || workingMemory === undefined || dailyNotes === undefined;

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <span className="animate-pulse text-sm text-secondary">Loading memory...</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* SOUL Preview (read-only) */}
      <SoulPreview
        content={soulMemory?.content ?? "No SOUL defined."}
      />

      {/* Working Memory (editable) */}
      <WorkingMemoryPanel
        agentId={agentId}
        content={workingMemory?.content ?? ""}
        updatedAt={workingMemory?.updatedAt}
        version={workingMemory?.version}
      />

      {/* Daily Notes List */}
      <DailyNotesList
        notes={dailyNotes ?? []}
      />
    </div>
  );
}
