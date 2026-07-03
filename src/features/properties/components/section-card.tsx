import type { ReactNode } from "react";

import { cn } from "@/lib/utils";



type SectionCardProps = {

  title: string;

  description?: string;

  action?: ReactNode;

  children: ReactNode;

  className?: string;

};



export function SectionCard({

  title,

  description,

  action,

  children,

  className,

}: SectionCardProps) {

  return (

    <section

      className={cn(

        "larssh-card larssh-card-hover overflow-hidden rounded-2xl transition-all",

        className

      )}

    >

      <div className="flex items-start justify-between gap-4 border-b border-white/5 bg-gradient-to-r from-gold/[0.04] to-transparent px-5 py-5 md:px-6">

        <div>

          <h2 className="text-base font-semibold tracking-tight">{title}</h2>

          {description ? (

            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">

              {description}

            </p>

          ) : null}

        </div>

        {action}

      </div>

      <div className="px-5 py-5 md:px-6 md:py-6">{children}</div>

    </section>

  );

}



type InfoItemProps = {

  label: string;

  value: ReactNode;

  className?: string;

};



export function InfoItem({ label, value, className }: InfoItemProps) {

  return (

    <div className={className}>

      <dt className="larssh-label">{label}</dt>

      <dd className="mt-2 text-sm font-medium">{value}</dd>

    </div>

  );

}



export function InfoGrid({

  children,

  columns = 2,

}: {

  children: ReactNode;

  columns?: 2 | 3 | 4;

}) {

  return (

    <dl

      className={cn(

        "grid gap-6",

        columns === 2 && "sm:grid-cols-2",

        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",

        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4"

      )}

    >

      {children}

    </dl>

  );

}



export function PlaceholderValue({ label = "Not specified" }: { label?: string }) {

  return <span className="text-muted-foreground font-normal">{label}</span>;

}

