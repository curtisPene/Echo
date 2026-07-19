import { UserRepository } from "../ports/UserRepository";

export class VerifyUserIdService {
  constructor(private readonly userRepo: UserRepository) {}

  async execute({ userId }: { userId: string }): Promise<boolean> {
    const user = await this.userRepo.findById({ id: userId });

    return user !== null;
  }
}
