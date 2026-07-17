import { userRepo } from "../repo/UserRepo";

export class VerifyUserIdService {
  async execute({ userId }: { userId: string }): Promise<boolean> {
    const user = await userRepo.findById({ id: userId });

    return user !== null;
  }
}
