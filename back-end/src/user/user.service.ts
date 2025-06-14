import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpInput } from 'src/auth/types';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { Activity } from 'src/activity/activity.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async getByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email }).exec();
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(
    data: SignUpInput & {
      role?: User['role'];
    },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({ ...data, password: hashedPassword });
    return user.save();
  }

  async updateToken(id: string, token: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.token = token;
    return user.save();
  }

  async countDocuments(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async setDebugMode({
    userId,
    enabled,
  }: {
    userId: string;
    enabled: boolean;
  }): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      {
        debugModeEnabled: enabled,
      },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getFavoritesActivities(userId: string): Promise<Activity[]> {
    const user = await this.getById(userId);
    await user.populate('favoriteActivities');
    return user.favoriteActivities;
  }

  async reorderFavoriteActivities(
    userId: string,
    newOrder: string[],
  ): Promise<Activity[]> {
    const user = await this.getById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentFavs = user.favoriteActivities.map((id) => id.toString());
    const validNewOrder = newOrder.filter((id) => currentFavs.includes(id));

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { favoriteActivities: validNewOrder },
        { new: true },
      )
      .populate('favoriteActivities')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser.favoriteActivities;
  }

  async addFavoriteActivity(userId: string, activity: Activity): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { favoriteActivities: activity._id } },
        { new: true },
      )
      .populate('favoriteActivities')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async removeFavoriteActivity(
    userId: string,
    activity: Activity,
  ): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, {
        $pull: { favoriteActivities: activity._id },
      })
      .populate('favoriteActivities')
      .exec();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
