import type { ServiceResult } from "@/types";

export interface AuthSocketApi {
  logout(): Promise<ServiceResult<null>>;
}
