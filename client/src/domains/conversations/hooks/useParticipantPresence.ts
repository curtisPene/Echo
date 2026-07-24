import { usePresence } from "@/domains/presence/stores/usePresence";
import type { ParticipantDTO } from "../entities/room";

export const useParticipantPresence = (participant: ParticipantDTO) => {
  return usePresence((state) => state.onlineUserIds[participant.userId] ?? false);
};
