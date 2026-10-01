'use client';

import type { ReactNode } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useProtectedDriveFileUrl } from '@/hooks/useProtectedDriveFileUrl';
import { isUuidLike } from '@/lib/internalPageLinks';
import type { AssignmentSubmission } from '@/lib/supabase';

type SubmissionFile = Pick<AssignmentSubmission,
  'drive_file_id' | 'file_name' | 'mime_type' | 'drive_web_view_link' | 'current_file_version_id'>;

interface Props {
  submission: SubmissionFile | null | undefined;
  className: string;
  children?: ReactNode;
}

/** Version pointers override legacy URLs. Identity/source replacement unmounts any pending read;
 * the existing private reader, not this UI, authorizes each online ticket/body request. */
export function SubmissionFileLink(props: Props) {
  const { user, member, activeChoir, isLoading, isSwitchingChoir } = useAuth();
  if (!props.submission) return null;
  if (isLoading || isSwitchingChoir || !user || !member || !activeChoir) return null;

  const pointer = props.submission.current_file_version_id;
  if (pointer != null && !isUuidLike(pointer)) {
    return <UnavailableLink className={props.className} compact={props.children == null} error />;
  }
  const sourceKey = JSON.stringify([user.id, activeChoir.choir_id, member.id, pointer,
    props.submission.drive_file_id, props.submission.drive_web_view_link,
    props.submission.file_name, props.submission.mime_type]);
  return <ResolvedSubmissionFileLink key={sourceKey} {...props} />;
}

function ResolvedSubmissionFileLink({ submission, className, children }: Props) {
  const versionId = submission?.current_file_version_id?.trim();
  const legacyUrl = versionId ? null : (submission?.drive_web_view_link || null);
  // R2 versions need no legacy Drive ID. This matches the immutable cache identity written
  // by the submission transaction, so two versions never share the old Drive cache key.
  const file = submission && !legacyUrl
    ? { ...submission, drive_file_id: versionId ? `r2_${versionId}` : submission.drive_file_id }
    : null;
  const { url, error } = useProtectedDriveFileUrl(file, { assignmentFileVersionId: versionId });
  if (!versionId && !legacyUrl && !submission?.drive_file_id) return null;
  const href = legacyUrl ?? url;
  if (!href) {
    return <UnavailableLink className={className} compact={children == null} error={Boolean(error)} />;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}
      aria-label={children == null ? `Dosyayı aç: ${submission?.file_name}` : undefined}
      data-genova-file-name={submission?.file_name}
      data-genova-mime-type={submission?.mime_type ?? undefined}>
      {children ?? <ExternalLink size={13} />}
    </a>
  );
}

function UnavailableLink({ className, compact, error }: { className: string; compact: boolean; error: boolean }) {
  const message = error ? 'Dosyaya erişilemiyor.' : 'Dosya hazırlanıyor...';
  return <span className={className} role="status" aria-label={message} title={message}>
    {compact ? (error ? <ExternalLink size={13} className="opacity-50" /> : <Loader2 size={13} className="animate-spin" />) : message}
  </span>;
}
