import { Calendar, CheckCircle2, RefreshCw, User } from "lucide-react";

import type { Task } from "../../types";
import { formatShortDate } from "../../lib/formatters";
import { PriorityBadge } from "../priority-badge";
import { cn } from "@/lib/utils";

type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task }: TaskItemProps) {
  const isCompleted = task.category === "completed";

  return (
    <article
      className={cn(
        "rounded-xl border border-white/5 bg-card/70 p-4 transition-colors hover:border-gold/15",
        isCompleted && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
              isCompleted
                ? "bg-emerald-500/10 text-emerald-400"
                : task.category === "overdue"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-gold-muted text-gold"
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="size-4" />
            ) : task.category === "recurring" ? (
              <RefreshCw className="size-4" />
            ) : (
              <Calendar className="size-4" />
            )}
          </div>
          <div>
            <h3
              className={cn(
                "font-semibold tracking-tight",
                isCompleted && "line-through"
              )}
            >
              {task.title}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              {task.description}
            </p>
          </div>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <User className="size-3" />
          {task.assignee}
        </span>
        <span>Due {formatShortDate(task.dueDate)}</span>
        {task.recurringLabel ? (
          <span className="text-gold">{task.recurringLabel}</span>
        ) : null}
      </div>
    </article>
  );
}
