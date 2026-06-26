"use client";

/**
 * Left column of the Business Profile form.
 * Renders read-only registration fields + editable DBA name, EIN, and billing email.
 *
 * @param {{ register: Function, errors: Object, registration: { agencyName: string, fullName: string, phone: string } }} props
 */
export function BusinessProfileIdentityFields({ register, errors, registration }) {
    return (
        <div className="space-y-6">
            <ReadOnlyField id="agencyName" label="Agency Legal Name" value={registration.agencyName} />
            <ReadOnlyField id="primaryContact" label="Primary Contact Person" value={registration.fullName} />
            <ReadOnlyField id="phone" label="Phone" value={registration.phone} />

            <div className="flex flex-col gap-2">
                <label htmlFor="dbaName" className="text-text-main text-base font-semibold">
                    DBA Name{" "}
                    <span className="text-text-muted font-normal text-sm">(optional)</span>
                </label>
                <input
                    id="dbaName"
                    type="text"
                    {...register("dbaName")}
                    placeholder="e.g. Jocham Home Health"
                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
                {errors.dbaName && (
                    <p className="text-red-500 text-sm">{errors.dbaName.message}</p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="ein" className="text-text-main text-base font-semibold">
                    EIN{" "}
                    <span className="text-text-muted font-normal text-sm">(optional)</span>
                </label>
                <input
                    id="ein"
                    type="text"
                    {...register("ein")}
                    placeholder="e.g. 45-1234567"
                    className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                        errors.ein ? "border-red-500" : "border-border-light"
                    }`}
                />
                {errors.ein && (
                    <p className="text-red-500 text-sm">{errors.ein.message}</p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="billingEmail" className="text-text-main text-base font-semibold">
                    Billing Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                    id="billingEmail"
                    type="email"
                    {...register("billingEmail")}
                    placeholder="billing@youragency.com"
                    className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                        errors.billingEmail ? "border-red-500" : "border-border-light"
                    }`}
                />
                {errors.billingEmail && (
                    <p className="text-red-500 text-sm">{errors.billingEmail.message}</p>
                )}
            </div>
        </div>
    );
}

/**
 * @param {{ id: string, label: string, value: string }} props
 */
function ReadOnlyField({ id, label, value }) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-text-main text-base font-semibold">
                {label}
            </label>
            <input
                id={id}
                type="text"
                readOnly
                value={value}
                className="w-full px-4 py-3 rounded-lg border border-border-light bg-gray-50 text-text-muted cursor-default outline-none"
            />
        </div>
    );
}
