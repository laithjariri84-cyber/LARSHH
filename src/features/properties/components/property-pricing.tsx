import type { PropertyDetailsViewModel } from "@/features/properties/types";

import { formatCurrency, formatDateShort, formatLabel } from "@/lib/utils";

import { InfoGrid, InfoItem, SectionCard } from "./section-card";



type PropertyPricingProps = {

  property: PropertyDetailsViewModel;

};



export function PropertyPricing({ property }: PropertyPricingProps) {

  const { pricing, listingType } = property;



  return (

    <SectionCard

      title="Pricing"

      description="Current asking price from the active listing"

    >

      <div className="from-primary text-primary-foreground rounded-xl bg-gradient-to-br to-slate-800 p-5 shadow-sm">

        <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wide">

          {listingType ? `Asking Price (${formatLabel(listingType)})` : "Asking Price"}

        </p>

        <p className="mt-2 text-3xl font-semibold tracking-tight">

          {formatCurrency(pricing.askingPrice, pricing.currency)}

        </p>

      </div>



      {(pricing.askingRent !== null || pricing.askingSale !== null) &&

      listingType ? (

        <div className="mt-4 grid gap-4 sm:grid-cols-2">

          {pricing.askingRent !== null ? (

            <div className="rounded-xl border p-4">

              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">

                Rent listing

              </p>

              <p className="mt-2 text-xl font-semibold">

                {formatCurrency(pricing.askingRent, pricing.currency)}

              </p>

            </div>

          ) : null}

          {pricing.askingSale !== null ? (

            <div className="rounded-xl border p-4">

              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">

                Sale listing

              </p>

              <p className="mt-2 text-xl font-semibold">

                {formatCurrency(pricing.askingSale, pricing.currency)}

              </p>

            </div>

          ) : null}

        </div>

      ) : null}



      <div className="mt-6">

        <InfoGrid columns={3}>

          <InfoItem

            label="Price per sq ft"

            value={

              pricing.pricePerSqFt

                ? formatCurrency(pricing.pricePerSqFt, pricing.currency)

                : "—"

            }

          />

          <InfoItem

            label="Last updated"

            value={formatDateShort(pricing.lastUpdated)}

          />

          <InfoItem label="Currency" value={pricing.currency} />

        </InfoGrid>

      </div>

    </SectionCard>

  );

}


