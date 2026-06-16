import type { ApplicationStatus } from "@careeros/shared";
import { statusTone } from "../lib/constants";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`status-badge ${statusTone[status]}`}>{status}</span>;
}
