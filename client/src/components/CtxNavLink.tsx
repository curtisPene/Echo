import { useDevice } from "@/hooks/useDevice";
import { Link } from "react-router";

export const ContextNavLink = ({
  children,
  to,
  clickHandler,
}: {
  children: React.ReactNode;
  to: string;
  clickHandler: () => void;
}) => {
  const device = useDevice();

  return device === "mobile" ? (
    <Link to={to}>{children}</Link>
  ) : (
    <button onClick={clickHandler}>{children}</button>
  );
};
