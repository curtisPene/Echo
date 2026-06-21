import clsx from "clsx";
import styles from "./Form.module.css";

export const Form = ({
  className,
  ...props
}: React.ComponentProps<"form">) => (
  <form className={clsx(styles.form, className)} {...props} />
);

export const FormControl = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={clsx(styles.formControl, className)} {...props} />
);

export const Label = ({
  className,
  ...props
}: React.ComponentProps<"label">) => (
  <label className={clsx(styles.label, className)} {...props} />
);

export const Input = ({
  className,
  ...props
}: React.ComponentProps<"input">) => (
  <input className={clsx(styles.input, className)} {...props} />
);

export const Button = ({
  className,
  ...props
}: React.ComponentProps<"button">) => (
  <button className={clsx(styles.button, className)} {...props} />
);
