import { Repository } from "typeorm";
import { IActivityRepository } from "./activity.repository.interface";
import { Activity } from "@/common/entities/activity.entity";

export class ActivityRepository implements IActivityRepository {
    constructor(
        private activityRepository: Repository<Activity>
    ) { }
    async logActivity(activityData: Partial<Activity>): Promise<Activity> {
        const activity = this.activityRepository.create(activityData);
        return await this.activityRepository.save(activity);
    }
    async getActivitiesByUser(userId: string): Promise<Activity[]> {
        return await this.activityRepository.find({
            where: { actorId: userId },
            order: { created_at: "DESC" }
        });
    }
}