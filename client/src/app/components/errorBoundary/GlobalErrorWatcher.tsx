import { useGlobalError } from "@/stores/useGlobalError";

export const GlobalErrorWatcher = () => {
  const error = useGlobalError((state) => state.error);

  if (error) throw error;

  return null;
};
