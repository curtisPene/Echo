import { userRepo } from "../repo/UserRepo";

export interface UserIdentity {
  id: string;
  firstName: string;
  lastName: string;
}

export class FindUserIdentitiesService {
  async execute({ userIds }: { userIds: string[] }): Promise<UserIdentity[]> {
    const users = await userRepo.findByIds(userIds);

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
  }
}
