import { SectionCard } from './SectionCard';
import { TherapistDocumentRow } from './TherapistDocumentRow';

/**
 * "License Documents" card listing every uploaded document.
 * @param {{ documents: object[]|undefined, therapistUserId: string, reviewStartedAt?: string|null }} props
 */
export function TherapistDocumentsSection({ documents, therapistUserId, reviewStartedAt }) {
    return (
        <SectionCard title={`License Documents (${documents?.length ?? 0})`}>
            {!documents?.length ? (
                <p className="text-sm text-text-muted  py-2">No documents uploaded yet.</p>
            ) : (
                <div className="space-y-2.5">
                    {documents.map(doc => (
                        <TherapistDocumentRow
                            key={doc.id}
                            doc={doc}
                            therapistUserId={therapistUserId}
                            reviewStartedAt={reviewStartedAt}
                        />
                    ))}
                </div>
            )}
        </SectionCard>
    );
}
