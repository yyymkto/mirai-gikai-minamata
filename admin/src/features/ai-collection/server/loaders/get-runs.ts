import "server-only";
import type { CollectionRun } from "../../shared/types";
import { loadAllRuns, loadRun } from "../utils/storage";

export async function getRuns(): Promise<CollectionRun[]> {
  return loadAllRuns();
}

export async function getRun(runId: string): Promise<CollectionRun | null> {
  return loadRun(runId);
}
