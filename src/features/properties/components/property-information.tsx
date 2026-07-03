import type { PropertyDetailsViewModel } from "@/features/properties/types";

import { formatLabel } from "@/lib/utils";

import { InfoGrid, InfoItem, SectionCard } from "./section-card";



type PropertyInformationProps = {

  information: PropertyDetailsViewModel["information"];

};



export function PropertyInformation({

  information,

}: PropertyInformationProps) {

  return (

    <SectionCard

      title="Attributes"

      description="Physical characteristics and building metadata"

    >

      <InfoGrid columns={3}>

        <InfoItem

          label="Floor"

          value={information.floor ?? "—"}

        />

        <InfoItem

          label="View"

          value={information.view ? formatLabel(information.view) : "—"}

        />

        <InfoItem

          label="Furnishing"

          value={

            information.furnishing

              ? formatLabel(information.furnishing)

              : "—"

          }

        />

        <InfoItem

          label="Completion year"

          value={information.completionYear ?? "—"}

        />

      </InfoGrid>

    </SectionCard>

  );

}


