import { BcryptPasswordHasher } from "./adapters/BCryptAdapter";
import { JwtTokenSigner } from "./adapters/JWTTokenAdapter";
import { LoginService } from "./services/LoginService";
import { RegistrationService } from "./services/RegistrationService";
import { VerifyAccessTokenService } from "./services/VerifyAccessTokenService";
import { VerifyRefreshTokenService } from "./services/VerifyRefreshTokenService";
import { SearchUserService } from "./services/SearchUserService";
import { FindUserIdentitiesService } from "./services/FindUserIdentitiesService";
import { VerifyUserIdService } from "./services/VerifyUserIdService";
import { GetUsersContactsService } from "./services/GetUsersContactsService";

const passwordHasher = new BcryptPasswordHasher();
const tokenSigner = new JwtTokenSigner();

export const loginService = new LoginService(passwordHasher, tokenSigner);
export const registrationService = new RegistrationService(passwordHasher);
export const verifyAccessTokenService = new VerifyAccessTokenService(tokenSigner);
export const verifyRefreshTokenService = new VerifyRefreshTokenService(tokenSigner);
export const searchUserService = new SearchUserService();
export const findUserIdentitiesService = new FindUserIdentitiesService();
export const verifyUserIdService = new VerifyUserIdService();
export const getUsersContactsService = new GetUsersContactsService();
