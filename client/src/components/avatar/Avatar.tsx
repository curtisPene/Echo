import clsx from "clsx";
import styles from "./Avatar.module.css";

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

export const AvatarGroup = ({ participants }: { participants: number }) => {
  return (
    <div className={clsx(styles.groupRoot, "avatarGroup")}>
      <Avatar firstName="John" lastName="Doe" />
      <Avatar firstName="Jane" lastName="Doe" />
      {participants > 2 && (
        <span className={clsx(styles.participants, "participants")}>
          +{participants - 2}
        </span>
      )}
    </div>
  );
};
