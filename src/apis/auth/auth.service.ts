import { redisCache, redisStream } from '@/config/redis.config';
import { toUserResponse } from '../user/mapper/user.mapper';
import { RegisterForm, RequestOTPForm, RequestOTPResponse, VerifyOTPForm, ResetPasswordForm, ResetPasswordFormHaveLoggedIn } from './schemas/auth.schema';
import { User } from "@/common/entities/user.entity";
import { AuthFailureError, BadRequestError, ConflictRequestError, NotFoundError } from "@/common/handler/error.response";;
import { comparePassword, hashPassword } from "@/common/utils/handlePassword";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/common/utils/auth.util";
import { UserResponse } from '../user/schemas';
import { Request } from 'express';
import { EmailService } from '@/common/utils/mailService';
import { IUserRepository } from '../user/repositories/user.repository.interface';
import { OtpService } from '@/common/utils/otpService';
import { EMAIL_STREAM } from '@/common/constants/redis';
interface OtpRedisData {
    otp: string;
    isVerified: boolean;
}
export default class AuthService {
    private otpService: OtpService
    constructor(private userRepository: IUserRepository) {
        this.otpService = new OtpService()
    }

    login = async (credentials: { username: string, password: string }): Promise<{ accessToken: string, refreshToken: string }> => {
        const { username, password } = credentials
        console.log(username);
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new AuthFailureError(`Username ${username} is not found!`)
        }
        if (!user.isVerified) {
            throw new AuthFailureError(`Your email account is not verified!`)
        }
        console.log('User found for login:', user);
        // call compare password
        const hashedPassword = user.password;
        const verifyPassword = await comparePassword(password, hashedPassword)
        if (!verifyPassword) {
            throw new AuthFailureError(`Password is incorrect!`)
        }
        const payload = { sub: user.id, username: user.username, email: user.email }
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        return { accessToken, refreshToken }
    }
    register = async (userData: RegisterForm): Promise<RequestOTPResponse> => {
        const { fullname, username, email, password } = userData;
        const existingUserByEmail = await this.userRepository.findByEmail(email);
        if (existingUserByEmail) {
            throw new ConflictRequestError(`Email ${email} is already in use.`);
        }
        const existingUserByUsername = await this.userRepository.findByUsername(username);
        if (existingUserByUsername) {
            throw new ConflictRequestError(`Username ${username} is already in use.`);
        }
        await this.userRepository.create({
            fullname,
            username,
            email,
            password: await hashPassword(password),
        })
        // pass message to redis streaming service
        const otp = this.otpService.generateOTP();
        await this.otpService.saveOTP(email, otp);
        await redisStream.xadd(EMAIL_STREAM, '*', 'type', 'send_otp', 'email', email, 'otp', otp);
        return {
            email,
            message: 'OTP has been sent to your email address.'
        }
    }

    verifyEmail = async (data: VerifyOTPForm) => {
        const { email, otp } = data;
        await this.otpService.verifyOTP(email, otp);
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError(`User with email ${email} not found.`);
        }
        user.isVerified = true;
        await this.userRepository.update(user.id, user);
        return {
            email,
            message: 'Email has been successfully verified.'
        }
    }
    resendOTP = async (email: string): Promise<RequestOTPResponse> => {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError(`User with email ${email} not found.`);
        }
        if (user.isVerified) {
            throw new BadRequestError('Email is already verified.');
        }
        const canResendOtp = await this.otpService.canResendOTP(email);
        if (!canResendOtp) {
            throw new BadRequestError('OTP was sent recently. Please wait before requesting a new one.');
        }
        const otp = this.otpService.generateOTP();
        await this.otpService.saveOTP(email, otp);
        await redisStream.xadd(EMAIL_STREAM, '*', 'type', 'send_otp', 'email', email, 'otp', otp);
        return {
            email,
            message: 'OTP has been resent to your email address.'
        }
    }
    googleLogin = async (user: User | null): Promise<{ refreshToken: string }> => {
        if (!user) {
            throw new NotFoundError('User account was not created!')
        }
        const payload = { sub: user.id, username: user.username, email: user.email }
        const refreshToken = signRefreshToken(payload);
        console.log('Generated refresh token for Google login:', refreshToken); // Debug log
        return { refreshToken }
    }
    // Forgot password: request OTP for existing account
    requestForgotPassword = async (data: RequestOTPForm): Promise<RequestOTPResponse> => {
        const rawEmail = data.email;
        const email = rawEmail.trim().toLowerCase();
        const existingUser = await this.userRepository.findByEmail(email);
        if (!existingUser) {
            throw new NotFoundError(`This email is not registered!`)
        }

        // reuse OtpService for generation/storage/resend rules
        const canResend = await this.otpService.canResendOTP(email);
        if (!canResend) {
            throw new BadRequestError('OTP was sent recently. Please wait before requesting a new one.');
        }

        const otp = this.otpService.generateOTP();
        await this.otpService.saveOTP(email, otp);
        await redisStream.xadd(EMAIL_STREAM, '*', 'type', 'forgot_password', 'email', email, 'otp', otp);

        if (process.env.NODE_ENV !== 'production') {
            // OTP stored under OtpService keys (debug only)
            console.log(`[DEV] requestForgotPassword generated OTP for ${email}`);
        }

        return {
            email: email,
            message: 'OTP has been sent to your email.'
        }
    }

    verifyForgotOTP = async (data: VerifyOTPForm): Promise<{ email: string, message: string }> => {
        const rawEmail = data.email;
        const email = rawEmail.trim().toLowerCase();
        const otp = data.otp.trim();

        // reuse OtpService verify (this will remove the stored OTP and attempts)
        await this.otpService.verifyOTP(email, otp);

        // mark a short-lived 'forgot verified' flag so reset can proceed without OTP
        const verifiedKey = `forgot-verified:${email}`;
        await redisCache.set(verifiedKey, '1', 'EX', 600);

        if (process.env.NODE_ENV !== 'production') {
            const ttl = await redisCache.ttl(verifiedKey);
            console.log(`[DEV] verifyForgotOTP set ${verifiedKey} TTL=${ttl}s`);
        }

        return { email, message: 'OTP verified successfully.' }
    }

    resetPassword = async (data: ResetPasswordForm): Promise<{ message: string, email: string, user: UserResponse }> => {
        const rawEmail = data.email;
        const email = rawEmail.trim().toLowerCase();
        const { newPassword } = data;
        if (!email) {
            throw new BadRequestError('Email is required.');
        }
        const verifiedKey = `forgot-verified:${email}`;
        const verified = await redisCache.get(verifiedKey);
        if (!verified) {
            throw new BadRequestError('OTP not verified. Please verify OTP before resetting password.');
        }
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new NotFoundError('User not found!');
        user.password = await hashPassword(newPassword);
        const updatedUser = await this.userRepository.update(user.id, user);
        // No need to explicitly delete OTP here — Redis TTL will expire the key.
        // remove verified flag after successful reset
        await redisCache.del(verifiedKey);
        return {
            message: 'Password has been reset successfully.',
            email,
            user: toUserResponse(updatedUser)
        }
    }



    refreshToken = async (req: Request): Promise<{ newAccessToken: string, newRefreshToken: string }> => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new AuthFailureError('Refresh token is not found!')
        }
        const { sub, username, email } = verifyRefreshToken(refreshToken)
        const newPayload = { sub, username, email }
        const newAccessToken = signAccessToken(newPayload)
        const newRefreshToken = signRefreshToken(newPayload)
        return {
            newAccessToken,
            newRefreshToken
        }
    }
    resetPasswordHaveLoggedIn = async (data: ResetPasswordFormHaveLoggedIn): Promise<{ message: string, email: string, user: UserResponse }> => {
        const rawEmail = data.email;
        const email = rawEmail.trim().toLowerCase();
        const { currentPassword, newPassword } = data;
        if (!email) {
            throw new BadRequestError('Email is required.');
        }
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new NotFoundError('User not found!');

        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestError('Current password is incorrect.');
        }
        user.password = await hashPassword(newPassword);
        const updatedUser = await this.userRepository.update(user.id, user);
        return {
            message: 'Password has been reset successfully.',
            email,
            user: toUserResponse(updatedUser)
        }
    }
}
