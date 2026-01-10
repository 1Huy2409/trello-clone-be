import { redisCache } from "@/config/redis.config";
import { BadRequestError } from "../handler/error.response";
import { parse } from "path";

export class OtpService {
    private readonly OTP_EXPIRATION = 300;
    private readonly MAX_ATTEMPTS = 5;
    private readonly ATTEMPT_WINDOW = 300;

    generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async saveOTP(email: string, otp: string): Promise<void> {
        const otpKey = `otp:register:${email}`;
        const attemptsKey = `otp:attempts:${email}`;
        await redisCache.setex(otpKey, this.OTP_EXPIRATION, otp);
        await redisCache.del(attemptsKey);
    }

    async verifyOTP(email: string, otp: string): Promise<boolean> {
        const attemptsKey = `otp:attempts:${email}`;
        const attempts = await redisCache.get(attemptsKey);
        if (attempts && parseInt(attempts) >= this.MAX_ATTEMPTS) {
            throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
        }
        const key = `otp:register:${email}`;
        const storedOtp = await redisCache.get(key);
        if (!storedOtp) {
            throw new BadRequestError('OTP has expired or does not exist.');
        }
        const currentAttempts = parseInt(attempts || '0') + 1;
        await redisCache.setex(attemptsKey, this.ATTEMPT_WINDOW, currentAttempts.toString());
        if (storedOtp !== otp) {
            throw new BadRequestError('Invalid OTP provided.');
        }
        await redisCache.del(key);
        await redisCache.del(attemptsKey);
        return true;
    }
    async canResendOTP(email: string): Promise<boolean> {
        const resendKey = `otp:resend:${email}`;
        const lastSent = await redisCache.get(resendKey);
        if (lastSent) {
            return false;
        }
        await redisCache.setex(resendKey, 60, Date.now().toString());
        return true;
    }
}