import clsx from "clsx";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "menuIcon" | "icon";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

export const Button = ({
  variant = "primary",
  className,
  ...props
}: ButtonProps) => (
  <button
    className={clsx(
      styles.button,
      variant === "menuIcon" && styles.menuIcon,
      variant === "primary" && styles.primary,
      variant === "icon" && styles.icon,
      className,
    )}
    {...props}
  >
    {props.children}
  </button>
);
