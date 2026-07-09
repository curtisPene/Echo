import clsx from "clsx";
import styles from "./Avatar.module.css";
import type { RoomParticipant } from "@/features/rooms/types";

export const Avatar = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  const initials =
    firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
  return <div className={clsx(styles.root, "avatar")}>{initials}</div>;
};

export const AvatarGroup = ({
  participants,
}: {
  participants: RoomParticipant[];
}) => {
  const user1 = participants[0].user;
  const user2 = participants[1].user;
  return (
    <div className={clsx(styles.groupRoot, "avatarGroup")}>
      <Avatar firstName={user1.firstName} lastName={user1.lastName} />
      <Avatar firstName={user2.firstName} lastName={user2.lastName} />
      {participants.length > 2 && (
        <span className={clsx(styles.participants, "participants")}>
          +{participants.length - 2}
        </span>
      )}
    </div>
  );
};
