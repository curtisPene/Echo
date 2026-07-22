import { toast } from "sonner";

export type NotificationType = "success" | "warning" | "error";

export interface NotificationsPort {
  notify(message: string, type: NotificationType): void;
}

export class ShadSonnerAdapter implements NotificationsPort {
  constructor() {}

  notify(message: string, type: NotificationType = "success"): void {
    toast[type](message);
  }
}
