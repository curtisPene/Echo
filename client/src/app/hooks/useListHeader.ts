import { useLocation } from "react-router";

const listHeaderByPath: Record<string, string> = {
  "/chats": "Chats",
  "/requests": "Requests",
  "/profile": "Profile",
};

export const useListHeader = () => {
  const pathname = useLocation().pathname;

  return (
    Object.entries(listHeaderByPath).find(([path]) =>
      pathname.startsWith(path),
    )?.[1] ?? ""
  );
};
