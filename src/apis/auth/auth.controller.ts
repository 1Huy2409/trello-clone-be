import { Request, Response } from "express";
import AuthService from "./auth.service";
import { handleServiceResponse } from "@/common/utils/httpHandler";
import { ResponseStatus, ServiceResponse } from "@/common/models/service.response";
import { StatusCodes } from "http-status-codes";
import { User } from "@/common/entities/user.entity";
import { RegisterForm, RequestOTPForm, VerifyOTPForm, ResetPasswordForm, ResetPasswordFormHaveLoggedIn, ChangePasswordForm } from "./schemas/auth.schema";
import { AuthFailureError } from '@/common/handler/error.response';

export default class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    login = async (req: Request, res: Response) => {
        const data = {
            username: req.body.username,
            password: req.body.password
        }
        console.log(data)
        const { accessToken, refreshToken } = await this.authService.login(data)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            expires: new Date(Date.now() + 365 * 24 * 3600000)
        })
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Login successfully!',
            {
                accessToken: accessToken
            },
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res)
    }

    googleLogin = async (req: Request, res: Response) => {
        const user: User = req.user as User
        const { refreshToken } = await this.authService.googleLogin(user)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            // sameSite: "none",
            expires: new Date(Date.now() + 365 * 24 * 3600000)
        })
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Login successfully!',
            null,
            StatusCodes.OK
        )
        // return handleServiceResponse(serviceResponse, res)
        res.redirect(`${process.env.FRONTEND_BASE_URL}/TaskManagement-FE/#/oauth/success`)
    }

    requestOTP = async (req: Request, res: Response) => {
        const data: RegisterForm = req.body;
        const result = await this.authService.register(data);

        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            { email: result.email },
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    resendOTP = async (req: Request, res: Response) => {
        const data: RequestOTPForm = req.body;
        const result = await this.authService.resendOTP(data.email);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            { email: result.email },
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    verifyOTP = async (req: Request, res: Response) => {
        const data: VerifyOTPForm = req.body;
        const result = await this.authService.verifyEmail(data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            { email: result.email },
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }
    // Forgot password: request OTP for existing account
    requestForgotPassword = async (req: Request, res: Response) => {
        const data: RequestOTPForm = req.body;
        const result = await this.authService.requestForgotPassword(data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            { email: result.email },
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    verifyForgotOTP = async (req: Request, res: Response) => {
        const data: VerifyOTPForm = req.body;
        const result = await this.authService.verifyForgotOTP(data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            { email: result.email },
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    resetPassword = async (req: Request, res: Response) => {
        const data: ResetPasswordForm = req.body;
        const result = await this.authService.resetPassword(data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            { email: result.email, user: result.user },
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }



    refreshToken = async (req: Request, res: Response) => {
        const { newAccessToken, newRefreshToken } = await this.authService.refreshToken(req)
        res.clearCookie('refreshToken')
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            // sameSite: "none",
            expires: new Date(Date.now() + 365 * 24 * 3600000)
        })
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Refresh token successfully!',
            {
                accessToken: newAccessToken
            },
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res)
    }

    logout = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            throw new AuthFailureError(`Refresh token is not found!`)
        }
        res.clearCookie('refreshToken')
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Logout successfully!',
            null,
            StatusCodes.OK
        )
        return handleServiceResponse(serviceResponse, res)
    }

    verifyToken = async (req: Request, res: Response) => {
        // Middleware authenticateToken đã verify token rồi
        // Nếu đến đây nghĩa là token hợp lệ
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            'Token is valid',
            { valid: true },
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }
    resetPasswordHaveLoggedIn = async (req: Request, res: Response) => {
        const data: ResetPasswordFormHaveLoggedIn = req.body;
        const result = await this.authService.resetPasswordHaveLoggedIn(data);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            { email: result.email, user: result.user },
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }

    changePassword = async (req: Request, res: Response) => {
        const data: ChangePasswordForm = req.body;
        const userId = (req.user as User).id;
        const result = await this.authService.changePassword(data, userId);
        const serviceResponse = new ServiceResponse(
            ResponseStatus.Sucess,
            result.message,
            { email: result.email, user: result.user },
            StatusCodes.OK
        );
        return handleServiceResponse(serviceResponse, res);
    }
}
