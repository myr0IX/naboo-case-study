import { Context, Query, Resolver } from '@nestjs/graphql';
import { UserService } from '../../user/user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from 'src/user/user.schema';
import { ContextWithJWTPayload } from 'src/auth/types/context';
import { Activity } from 'src/activity/activity.schema';

@Resolver('Me')
export class MeResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  async getMe(@Context() context: ContextWithJWTPayload): Promise<User> {
    // the AuthGard will add the user to the context
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.userService.getById(context.jwtPayload.id);
  }

  // @Query(()=> Activity[])
  // @UseGuards(AuthGuard)
  // async getFavorites(@Context() context: ContextWithJWTPayload) {
  //   const userId = context.jwtPayload.id;
  //   const user = await this.userService.getById(userId);

  //   return user.favoriteActivities
  // }
}
