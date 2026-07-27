"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { individualMedicalInfoSchema } from "@/lib/validators/individual.onboarding.schema";
import { individualOnboardingAPI } from "@/services/onboarding.individual.api";
import useIndividualOnboardingStore from "@/stores/individualOnboardingStore";
import { logger } from "@/lib/logger";

/**
 * @returns {{ ready: boolean, register: Function, handleSubmit: Function, errors: object, loading: boolean, submitError: string|null, onSubmit: Function, therapyOrderDocument: object|null, uploadingDocument: boolean, documentError: string, onDocumentDrop: Function, onDocumentRemove: Function }}
 */
export function useIndividualMedicalInfoForm() {
    const router = useRouter();
    const updateMedicalInfo = useIndividualOnboardingStore((s) => s.updateMedicalInfo);
    const markStepComplete = useIndividualOnboardingStore((s) => s.markStepComplete);
    const setCurrentStep = useIndividualOnboardingStore((s) => s.setCurrentStep);
    const therapyOrderDocument = useIndividualOnboardingStore((s) => s.therapyOrderDocument);
    const setTherapyOrderDocument = useIndividualOnboardingStore((s) => s.setTherapyOrderDocument);

    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [uploadingDocument, setUploadingDocument] = useState(false);
    const [documentError, setDocumentError] = useState("");
    const [initialValues, setInitialValues] = useState({
        primaryDiagnosis: "",
        referringProviderName: "",
    });

    useEffect(() => {
        individualOnboardingAPI
            .getIndividualOnboardingData()
            .then((res) => {
                const data = res.data.data;
                const mi = data.medicalInfo;
                if (mi) {
                    setInitialValues({
                        primaryDiagnosis: mi.primaryDiagnosis || "",
                        referringProviderName: mi.referringProviderName || "",
                    });
                }
                if (data.therapyOrderDocument) {
                    setTherapyOrderDocument(data.therapyOrderDocument);
                }
            })
            .catch((err) => logger.error("Failed to load individual medical info data:", err))
            .finally(() => setReady(true));
    }, [setTherapyOrderDocument]);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(individualMedicalInfoSchema),
        defaultValues: initialValues,
        mode: "onSubmit",
    });

    useEffect(() => {
        if (ready) {
            setValue("primaryDiagnosis", initialValues.primaryDiagnosis);
            setValue("referringProviderName", initialValues.referringProviderName);
        }
    }, [ready, initialValues, setValue]);

    const onDocumentDrop = async (files) => {
        const file = files[0];
        if (!file) return;
        setDocumentError("");

        const MAX_SIZE = 25 * 1024 * 1024;
        const ALLOWED = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        if (file.size > MAX_SIZE) {
            setDocumentError(`${file.name} is too large. Maximum size is 25MB.`);
            return;
        }
        if (!ALLOWED.includes(file.type)) {
            setDocumentError(`${file.name} has invalid type. Only PDF, JPEG, and PNG are allowed.`);
            return;
        }

        setUploadingDocument(true);
        try {
            const result = await individualOnboardingAPI.uploadDocument(file, "therapy_order");
            setTherapyOrderDocument({
                id: result.id,
                path: result.path,
                fileName: result.fileName,
                fileSize: result.fileSize,
                documentType: result.documentType,
                mimeType: result.mimeType,
            });
        } catch (err) {
            setDocumentError(`Failed to upload ${file.name}. ${err.message}`);
        } finally {
            setUploadingDocument(false);
        }
    };

    const onDocumentRemove = async () => {
        setDocumentError("");
        if (!therapyOrderDocument) return;
        if (therapyOrderDocument.id) {
            try {
                await individualOnboardingAPI.deleteDocument(therapyOrderDocument.id);
            } catch {
                setDocumentError("Could not delete the document from storage. Please try again.");
                return;
            }
        }
        setTherapyOrderDocument(null);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setSubmitError(null);
        try {
            const payload = {
                primaryDiagnosis: data.primaryDiagnosis,
                referringProviderName: data.referringProviderName || null,
            };
            await individualOnboardingAPI.saveMedicalInfo(payload);
            updateMedicalInfo(payload);
            markStepComplete(3);
            setCurrentStep(4);
            router.push("/customer/onboarding/individual/activation");
        } catch (err) {
            logger.error("Failed to save individual medical info:", err);
            setSubmitError(
                err.response?.data?.message || "Failed to save medical information. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        ready,
        register,
        handleSubmit,
        errors,
        loading,
        submitError,
        onSubmit,
        therapyOrderDocument,
        uploadingDocument,
        documentError,
        onDocumentDrop,
        onDocumentRemove,
    };
}