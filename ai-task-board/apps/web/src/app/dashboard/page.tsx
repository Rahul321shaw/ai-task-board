"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { GoalCard } from "@/components/GoalCard";
import { NewGoalModal } from "@/components/NewGoalModal";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: number;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: string;
  tasks: Task[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const session = await apiClient.get("/api/auth/get-session");
        if (!session?.user) {
          router.push("/login");
          return;
        }
        setUser(session.user);
        const goalsData = await apiClient.get("/api/goals");
        setGoals(goalsData);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleTaskUpdate = async (taskId: string, status: Task["status"]) => {
    await apiClient.patch(`/api/tasks/${taskId}`, { status });
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      }))
    );
  };

  const handleGoalCreated = (goal: Goal) => {
    setGoals((prev) => [goal, ...prev]);
    setShowNewGoal(false);
  };

  const handleSignOut = async () => {
    await apiClient.post("/api/auth/sign-out", {});
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Task Board</h1>
          <p className="text-sm text-gray-500">Goal decomposition powered by GPT-4o</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Goals ({goals.length})
          </h2>
          <button
            data-testid="new-goal-button"
            onClick={() => setShowNewGoal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            + New Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">No goals yet</p>
            <button
              onClick={() => setShowNewGoal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create your first goal
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onTaskUpdate={handleTaskUpdate}
              />
            ))}
          </div>
        )}
      </main>

      {showNewGoal && (
        <NewGoalModal
          onClose={() => setShowNewGoal(false)}
          onCreated={handleGoalCreated}
        />
      )}
    </div>
  );
}
