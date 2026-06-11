import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Fetch visit types from the curated catalog, filtered by service type and audience.
 *
 * @param {object} opts
 * @param {string} [opts.serviceType] - Customer-facing service type (e.g. "Physical Therapy")
 * @param {"customer"|"therapist"} [opts.audience="therapist"]
 *        - "customer" filters to customerVisible=true entries
 *        - "therapist" includes all codes for the discipline
 * @param {boolean} [opts.useOwnDiscipline=false]
 *        - When true and no serviceType is given, the backend resolves the
 *          discipline from the authenticated therapist's primaryLicenseType
 * @param {boolean} [opts.enabled=true]
 */
export const useVisitTypes = ({ serviceType, audience = "therapist", useOwnDiscipline = false, enabled = true } = {}) =>
    useQuery({
        queryKey: ["visit-types", serviceType, audience, useOwnDiscipline],
        queryFn: () =>
            api
                .get("/visit-types", { params: { serviceType, audience } })
                .then((r) => r.data.data),
        enabled: enabled && (!!serviceType || useOwnDiscipline),
        staleTime: 10 * 60 * 1000, // 10 min — catalog rarely changes
    });
