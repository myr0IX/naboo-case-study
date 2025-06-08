import { Context, Query, Resolver, Args, Mutation } from '@nestjs/graphql';
import { UserService } from '../../user/user.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { User } from 'src/user/user.schema';
import { ContextWithJWTPayload } from 'src/auth/types/context';
import { Activity } from 'src/activity/activity.schema';
import { ActivityService } from 'src/activity/activity.service';

@Resolver('Me')
export class MeResolver {
  constructor(
    private readonly userService: UserService,
    private readonly activityService: ActivityService,
  ) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  async getMe(@Context() context: ContextWithJWTPayload): Promise<User> {
    // the AuthGard will add the user to the context
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.userService.getById(context.jwtPayload.id);
  }

  @Query(() => [Activity])
  @UseGuards(AuthGuard)
  async getFavorites(@Context() context: ContextWithJWTPayload) {
    const userId = context.jwtPayload.id;
    const user = await this.userService.getById(userId);

    return user.favoriteActivities;
  }

  @Mutation(() => [Activity])
  @UseGuards(AuthGuard)
  async addFavorite(
    @Context() context: ContextWithJWTPayload,
    @Args('id') id: string,
  ) {
    try {
      const activity = await this.activityService.findOne(id);
      const updateUser = await this.userService.addFavoriteActivity(
        context.jwtPayload.id,
        activity,
      );
      return updateUser.favoriteActivities;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Mutation(() => [Activity])
  @UseGuards(AuthGuard)
  async removeFavorite(
    @Context() context: ContextWithJWTPayload,
    @Args('id') id: string,
  ) {
    try {
      const activity = await this.activityService.findOne(id);
      const updateUser = await this.userService.removeFavoriteActivity(
        context.jwtPayload.id,
        activity,
      );
      return updateUser.favoriteActivities;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
