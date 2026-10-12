import { Suspense } from "react";
import { CustomerProfileContent } from "@/components/customer/profile/CustomerProfileContent";
import { CustomerProfileSkeleton } from "@/components/customer/profile/CustomerProfileSkeleton";

export default function CustomerProfilePage() {
    return (
        <Suspense fallback={<CustomerProfileSkeleton />}>
            <CustomerProfileContent />
        </Suspense>
    );
}
