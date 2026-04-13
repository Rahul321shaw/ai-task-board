// Shared types between API and web

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type GoalStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number;
  goalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  status: GoalStatus;
  userId: string;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}
