import clsx from "clsx";
import { Avatar } from "@/components/avatar/Avatar";
import styles from "./ContactsListItem.module.css";
import type { Contact } from "../../types";

export const ContactsListItem = ({
  contact,
}: {
  contact: Contact & { online: boolean };
}) => (
  <div className={clsx(styles.root, "contactsListItem")}>
    <div className={styles.avatarWrapper}>
      <Avatar firstName={contact.firstName} lastName={contact.lastName} />
      {contact.online && <span className={styles.onlineDot} />}
    </div>
    <span className={styles.name}>
      {contact.firstName} {contact.lastName}
    </span>
  </div>
);
