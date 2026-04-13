"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api";

interface NewGoalModalProps {
  onClose: () => void;
  onCreated: (goal: any) => void;
}

export function NewGoalModal({ onClose, onCreated }: NewGoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [decompose, setDecompose] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const goal = await apiClient.post("/api/goals", { title, description, decompose });
      onCreated(goal);
    } catch (err: any) {
      setError(err.message || "Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">New Goal</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal title *</label>
            <input
              type="text"
              data-testid="goal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Launch a SaaS product"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              data-testid="goal-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any details about this goal..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="decompose"
              checked={decompose}
              onChange={(e) => setDecompose(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="decompose" className="text-sm text-gray-700">
              Auto-decompose into tasks with AI (GPT-4o)
            </label>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="create-goal-button"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (decompose ? "Decomposing with AI..." : "Creating...") : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
