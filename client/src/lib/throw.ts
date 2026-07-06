import { useGlobalError } from "@/stores/useGlobalError";

export const throWError = (error: Error) => {
  useGlobalError.setState({ error });
};
