import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router";

export const NavItem = ({
  icon: Icon,
  to,
}: {
  to: string;
  icon: LucideIcon;
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "iconBarItem",
          "text-muted-foreground hover:bg-brand/10 hover:text-brand flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors",
          isActive && "bg-brand/15 text-brand",
        )
      }
    >
      <Icon size={18} />
    </NavLink>
  );
};
