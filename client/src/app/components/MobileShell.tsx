import clsx from "clsx";

export const MobileShell = () => {
  return (
    <div
      className={clsx(
        "mobileShell",
        "bg-background flex h-dvh w-full flex-col sm:hidden",
      )}
    >
      <div
        className={clsx(
          "mobileHeader",
          "from-brand/15 via-background to-background flex shrink-0 items-center gap-2 bg-linear-to-br px-5 pt-6 pb-4",
        )}
      >
        <h1 className="text-foreground min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight"></h1>
      </div>
      <div
        className={clsx(
          "contentPanel",
          "min-h-0 flex-1 overflow-y-auto p-4 pb-24",
        )}
      >
        {/* Outlet here */}
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
        ></div>
      </div>
    </div>
  );
};
