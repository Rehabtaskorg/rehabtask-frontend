import { MdLocationOn } from 'react-icons/md';
import { SectionCard } from './SectionCard';

/**
 * "Service Areas" card. Renders nothing when the therapist has no work areas.
 * @param {{ workAreas: object[]|undefined }} props
 */
export function TherapistServiceAreas({ workAreas }) {
    if (!workAreas?.length) return null;

    return (
        <SectionCard title={`Service Areas (${workAreas.length})`}>
            <div className="space-y-2">
                {workAreas.map(area => (
                    <div key={area.id} className="flex items-start gap-2.5 text-sm">
                        <MdLocationOn className="text-base text-text-muted  mt-0.5 shrink-0" />
                        <span className="text-text-main ">
                            {[area.city, area.state, area.zipCode].filter(Boolean).join(', ')}
                        </span>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}
