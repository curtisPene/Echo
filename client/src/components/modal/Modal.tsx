import clsx from "clsx";
import styles from "./Modal.module.css";

type ModalHeaderProps = {
  title: string;
  description: string;
};

const ModalHeader = ({ title, description }: ModalHeaderProps) => (
  <div className={clsx(styles.dialogHeader)}>
    <span>{title}</span>
    <span>{description}</span>
  </div>
);

type ModalProps = React.ComponentProps<"dialog"> & {
  header?: ModalHeaderProps;
};

export const Modal = ({
  className,
  header,
  children,
  ref,
  ...props
}: ModalProps) => (
  <dialog className={clsx(styles.dialog, className)} ref={ref} {...props}>
    <div className={clsx(styles.inner)}>
      {header && <ModalHeader {...header} />}
      {children}
    </div>
  </dialog>
);
