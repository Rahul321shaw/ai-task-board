"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api";

const STATUS_COLS = [
  { key: "TODO", label: "To Do", color: "bg-gray-100" },
  { key: "IN_PROGRESS", label: "In Progress", color: "bg-blue-50" },
  { key: "DONE", label: "Done", color: "bg-green-50" },
] as const;

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  tasks: Task[];
}

interface GoalCardProps {
  goal: Goal;
  onTaskUpdate: (taskId: string, status: TaskStatus) => void;
}

export function GoalCard({ goal, onTaskUpdate }: GoalCardProps) {
  const [expanded, setExpanded] = useState(true);

  const tasksByStatus = STATUS_COLS.reduce(
    (acc, col) => {
      acc[col.key] = goal.tasks.filter((t) => t.status === col.key);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  const doneCount = tasksByStatus["DONE"].length;
  const totalCount = goal.tasks.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{goal.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4 ml-4">
          <div className="text-sm text-gray-500">
            {doneCount}/{totalCount} tasks
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4">
          <div className="grid grid-cols-3 gap-4">
            {STATUS_COLS.map((col) => (
              <div key={col.key} className={`${col.color} rounded-lg p-3`}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {col.label} ({tasksByStatus[col.key].length})
                </h4>
                <div className="space-y-2">
                  {tasksByStatus[col.key].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(status) => onTaskUpdate(task.id, status)}
                    />
                  ))}
                  {tasksByStatus[col.key].length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Empty</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
}) {
  const nextStatus: Record<TaskStatus, TaskStatus | null> = {
    TODO: "IN_PROGRESS",
    IN_PROGRESS: "DONE",
    DONE: null,
  };

  const next = nextStatus[task.status];

  return (
    <div
      data-testid={`task-card-${task.id}`}
      className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
    >
      <p className="text-sm font-medium text-gray-800">{task.title}</p>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}
      {next && (
        <button
          data-testid={`task-advance-${task.id}`}
          onClick={() => onStatusChange(next)}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          → Move to {next === "IN_PROGRESS" ? "In Progress" : "Done"}
        </button>
      )}
    </div>
  );
}
