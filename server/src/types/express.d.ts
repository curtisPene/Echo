import { IdentityDTO } from "../domains/authAndAccess/domainModels/identity";

declare global {
  namespace Express {
    interface Request {
      user?: IdentityDTO;
    }
  }
}
