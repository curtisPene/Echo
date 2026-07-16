import { ServiceResult } from "../../../types";
import { findContactsByUserId } from "../../conversations/repo/mongooseContactsRepo";
import { PublicUser, userPresenter } from "../../authAccess/presenters/usersPresenter";
import { userRepo } from "../../authAccess/repo/mongooseUserRepo";

export async function findUserService({
  email,
  viewerId,
}: {
  email: string;
  viewerId: string;
}): Promise<ServiceResult<{ user: PublicUser }>> {
  try {
    const user = await userRepo.findUserByEmail({ email });

    if (!user)
      return {
        success: false,
        message: "User not found",
        data: null,
      };

    const userContacts = await findContactsByUserId({
      userId: user.id,
    });

    // If the found user has blocked the viewer return success false
    if (
      userContacts.blocked.some(
        (blockedId) => blockedId.toString() === viewerId,
      )
    )
      return { success: false, message: "User blocked", data: null };

    return {
      success: true,
      message: "User found",
      data: { user: userPresenter(user) },
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "User not found",
      data: null,
    };
  }
}
