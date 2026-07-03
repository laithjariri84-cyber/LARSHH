import type { Task, TaskCategory } from "../../types";
import { TASK_SECTIONS } from "../../data/mock-crm-data";
import { TaskItem } from "./task-item";

type TasksModuleProps = {
  tasks: Task[];
};

export function TasksModule({ tasks }: TasksModuleProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {TASK_SECTIONS.map((section) => {
        const sectionTasks = tasks.filter(
          (task) => task.category === (section.id as TaskCategory)
        );

        return (
          <section
            key={section.id}
            className="rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <h3 className="text-sm font-semibold">{section.label}</h3>
              <span className="text-muted-foreground text-xs">
                {sectionTasks.length}
              </span>
            </div>
            <div className="space-y-3 p-3">
              {sectionTasks.length > 0 ? (
                sectionTasks.map((task) => <TaskItem key={task.id} task={task} />)
              ) : (
                <div className="text-muted-foreground rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-xs">
                  No tasks in this queue
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
