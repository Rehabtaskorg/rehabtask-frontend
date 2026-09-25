import { AdminCustomerDetail } from "@/components/features/admin/customers/AdminCustomerDetail";

export const metadata = { title: "Customer Details" };

export default async function AdminCustomerDetailPage({ params }) {
    const { id } = await params;
    return <AdminCustomerDetail customerUserId={id} />;
}