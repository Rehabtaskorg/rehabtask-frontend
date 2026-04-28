"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "@/lib/patients.api";

export function usePatients() {
    return useQuery({
        queryKey: ["agency-patients"],
        queryFn: async () => {
            const res = await patientsApi.getPatients();
            return res.data.data;
        },
    });
}

export function usePatient(patientId) {
    return useQuery({
        queryKey: ["agency-patient", patientId],
        queryFn: async () => {
            const res = await patientsApi.getPatient(patientId);
            return res.data.data;
        },
        enabled: !!patientId,
    });
}

export function useCreatePatient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => patientsApi.createPatient(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agency-patients"] });
        },
    });
}

export function useUpdatePatient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => patientsApi.updatePatient(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["agency-patients"] });
            queryClient.invalidateQueries({ queryKey: ["agency-patient"] });
        },
    });
}