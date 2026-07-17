import { useRooms } from "@/stores/useRooms";

export const selectRoomController = ({
  id,
  name,
}: {
  id: string;
  name: string;
}) => {
  useRooms.getState().setACtiveRoom({ id, name });
};

export const clearActiveRoomController = () => {
  useRooms.getState().clearActiveRoom();
};
