import { TokenPayload } from "../domains/authAccess/types";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
