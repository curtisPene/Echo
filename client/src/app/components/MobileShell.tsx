import clsx from "clsx";
import { useMobileShell } from "../hooks/useMobileShell";
import { NavIcon } from "./NavIcon";
import { EchoLogo } from "./EchoLogo";

export const MobileShell = () => {
  const { data, activeItem, setActiveItem } = useMobileShell();
  const navItems = data.navMain.filter((item) => item.title !== "Settings");
  const [firstHalf, secondHalf] = [
    navItems.slice(0, Math.ceil(navItems.length / 2)),
    navItems.slice(Math.ceil(navItems.length / 2)),
  ];

  return (
    <div
      className={clsx(
        "mobileShell",
        "bg-background flex h-dvh w-full flex-col sm:hidden",
      )}
    >
      <div
        className={clsx(
          "contentPanel",
          "min-h-0 flex-1 overflow-y-auto p-4 pb-24",
        )}
      >
        {activeItem.content && <activeItem.content />}
      </div>
      <div
        className={clsx(
          "bottomNav",
          "pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4",
        )}
      >
        <div
          className={clsx(
            "bottomNavBar",
            "bg-card pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-full px-4 py-2 shadow-md",
          )}
        >
          {firstHalf.map((item) => (
            <button
              key={item.title}
              data-active={item.title === activeItem.title}
              onClick={() => setActiveItem(item)}
              className={clsx(
                "bottomNavItem",
                "text-muted-foreground hover:bg-brand/10 hover:text-brand data-[active=true]:bg-brand/15 data-[active=true]:text-brand flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
              )}
            >
              <NavIcon item={item} />
            </button>
          ))}
          <div
            className={clsx(
              "bottomNavLogo",
              "bg-brand text-brand-foreground flex size-11 shrink-0 items-center justify-center rounded-full shadow-md",
            )}
          >
            <EchoLogo size={22} />
          </div>
          {secondHalf.map((item) => (
            <button
              key={item.title}
              data-active={item.title === activeItem.title}
              onClick={() => setActiveItem(item)}
              className={clsx(
                "bottomNavItem",
                "text-muted-foreground hover:bg-brand/10 hover:text-brand data-[active=true]:bg-brand/15 data-[active=true]:text-brand flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
              )}
            >
              <NavIcon item={item} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
