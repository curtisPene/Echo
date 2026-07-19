import { UserRepository } from "../ports/UserRepository";

export interface UserIdentity {
  id: string;
  firstName: string;
  lastName: string;
}

export class FindUserIdentitiesService {
  constructor(private readonly userRepo: UserRepository) {}

  async execute({ userIds }: { userIds: string[] }): Promise<UserIdentity[]> {
    const users = await this.userRepo.findByIds(userIds);

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
  }
}
