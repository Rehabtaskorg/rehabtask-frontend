import { SectionCard } from './SectionCard';

/**
 * "Professional Information" card on the therapist detail page.
 * @param {{ profile: object }} props
 */
export function TherapistProfessionalInfo({ profile }) {
    return (
        <SectionCard title="Professional Information">
            <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted ">Primary Discipline type</dt>
                    <dd className="font-medium text-text-main  text-right">
                        {profile?.primaryLicenseType || '—'}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted ">Onboarding progress</dt>
                    <dd className={`font-medium capitalize ${profile?.onboardingComplete ? 'text-emerald-600 ' : 'text-amber-600 '}`}>
                        {profile?.onboardingComplete ? 'Complete' : `Step ${profile?.onboardingStep ?? 1} of 8`}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted ">Service areas</dt>
                    <dd className="font-medium text-text-main ">
                        {profile?.workAreas?.length ?? 0} configured
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-text-muted ">Stripe connected</dt>
                    <dd className={`font-medium ${profile?.stripeAccountId ? 'text-emerald-600 ' : 'text-slate-400 '}`}>
                        {profile?.stripeAccountId ? 'Yes' : 'No'}
                    </dd>
                </div>
                {profile?.bio && (
                    <div className="pt-3 border-t border-border-light ">
                        <dt className="text-text-muted  mb-1.5">Bio</dt>
                        <dd className="text-text-main  leading-relaxed text-sm">
                            {profile.bio}
                        </dd>
                    </div>
                )}
            </dl>
        </SectionCard>
    );
}
