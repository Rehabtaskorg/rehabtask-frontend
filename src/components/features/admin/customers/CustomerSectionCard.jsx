/**
 * Card shell used by each section of the admin customer detail page.
 *
 * @param {{ title: string, children: React.ReactNode }} props
 */
export function CustomerSectionCard({ title, children }) {
    return (
        <div className="bg-card-light border border-border-light rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-main">{title}</h2>
            {children}
        </div>
    );
}
