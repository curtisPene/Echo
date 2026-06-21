import clsx from "clsx";
import styles from "./Card.module.css";

export const Card = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={clsx(styles.card, className)} {...props} />
);
