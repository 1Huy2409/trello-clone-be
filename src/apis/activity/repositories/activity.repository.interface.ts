import { Activity } from "@/common/entities/activity.entity";

export interface IActivityRepository {
    logActivity(activityData: any): Promise<Activity>;
    getActivitiesByUser(userId: string): Promise<Activity[]>;
}