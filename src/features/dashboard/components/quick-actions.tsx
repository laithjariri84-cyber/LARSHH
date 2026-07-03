"use client";

import {
  CalendarPlus,
  FileBarChart,
  Plus,
  Users,
} from "lucide-react";



import { notify } from "@/lib/notifications";

import type { QuickAction } from "../data/mock-dashboard";



const iconMap = {

  plus: Plus,

  calendar: CalendarPlus,

  file: FileBarChart,

  users: Users,

} as const;



type QuickActionsProps = {

  actions: QuickAction[];

};



export function QuickActions({ actions }: QuickActionsProps) {

  return (

    <section className="space-y-5">

      <h2 className="larssh-heading-lg">Quick Actions</h2>

      <div className="grid gap-4 sm:grid-cols-2">

        {actions.map((action, index) => {

          const Icon = iconMap[action.icon as keyof typeof iconMap] ?? Plus;

          return (

            <button

              key={action.label}

              type="button"

              className="larssh-card larssh-card-hover larssh-press group animate-slide-up flex items-start gap-4 rounded-2xl p-5 text-left"

              style={{ animationDelay: `${index * 50}ms` }}

              onClick={() =>

                notify.info(action.label, action.description)

              }

            >

              <div className="paragon-gold-gradient flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-gold/10 transition-transform group-hover:scale-105">

                <Icon className="text-gold-foreground size-4" />

              </div>

              <div>

                <p className="text-sm font-semibold">{action.label}</p>

                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">

                  {action.description}

                </p>

              </div>

            </button>

          );

        })}

      </div>

    </section>

  );

}

