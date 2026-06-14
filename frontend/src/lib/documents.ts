import type { Application, GenericRecord } from "@/src/types";
import { normalizedText } from "@/src/lib/format";
import { isManagement } from "@/src/config/roles";

/** Whether a document type's name/code/label matches any of the search terms. */
export function documentTypeMatches(type: GenericRecord | undefined, terms: string[]) {
  if (!type) return false;
  const haystack = `${normalizedText(type.name)} ${normalizedText(type.code)} ${normalizedText(type.document_name)}`;
  return terms.some((term) => haystack.includes(normalizedText(term)));
}

/** Find the id of the first document type matching the given terms. */
export function findDocumentTypeId(documentTypes: GenericRecord[], terms: string[]) {
  return documentTypes.find((type) => documentTypeMatches(type, terms))?.id;
}

/** Documents belonging to an application, optionally filtered by document-type terms. */
export function docsForApplication(
  documents: GenericRecord[],
  applicationId: number,
  documentTypes: GenericRecord[],
  terms?: string[],
) {
  return documents.filter((doc) => {
    if (doc.application_id !== applicationId) return false;
    if (!terms) return true;
    const type = documentTypes.find((item) => item.id === doc.document_type_id);
    return documentTypeMatches(type, terms);
  });
}

/** Map raw application workflow status to a role-specific display status. */
export function applicationStatusForRole(app: Application, role?: string, rejectedDocsCount = 0) {
  if (isManagement(role)) {
    if (app.status === "verification_failed" || rejectedDocsCount > 0) return "reupload_required";
    if (["verified", "committee_pending"].includes(app.status)) return "moved_to_committee";
    if (["submitted", "under_verification"].includes(app.status)) return "under_verification";
    if (app.status === "flat_assigned") return "flat_assigned";
    if (app.status === "rejected") return "committee_rejected";
    if (app.status === "approved") return "committee_approved";
  }
  return app.status;
}
