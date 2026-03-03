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
        },
    });
}