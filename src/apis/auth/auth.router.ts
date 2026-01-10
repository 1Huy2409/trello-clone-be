import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import AuthController from "./auth.controller";
import { Router } from "express";
import express from 'express'
import { asyncHandler } from "@/common/middleware/asyncHandler";
import passport from "passport";
import { checkAuthentication } from "@/common/middleware/authentication";
export default function authRouter(authController: AuthController): Router {
    const router: Router = express.Router()

    router.post('/login', asyncHandler(authController.login))
    // google oauth
    router.get('/google',
        passport.authenticate('google', {
            scope: ["email", "profile"],
            session: false
        })
    ) // ==> http://localhost:2409/api/v1/auth/google/callback?code=...
    router.get('/google/callback',
        passport.authenticate('google',
            { failureRedirect: '/login', session: false },
        ), // exchange authorization code for access token
        asyncHandler(authController.googleLogin)
    )
    // end google oauth
    router.post('/register', asyncHandler(authController.requestOTP))
    router.post('/resend-otp', asyncHandler(authController.resendOTP))
    // Forgot password flow
    router.post('/forgot-password/request', asyncHandler(authController.requestForgotPassword))
    router.post('/forgot-password/verify', asyncHandler(authController.verifyForgotOTP))
    router.post('/forgot-password/reset', asyncHandler(authController.resetPassword))
    router.post('/verify-otp', asyncHandler(authController.verifyOTP))
    router.post('/logout',
        asyncHandler(checkAuthentication),
        asyncHandler(authController.logout)
    )
    router.post('/processNewToken', asyncHandler(authController.refreshToken))
    router.get('/verify',
        asyncHandler(checkAuthentication),
        asyncHandler(authController.verifyToken)
    )
    router.post('/reset', asyncHandler(checkAuthentication), asyncHandler(authController.resetPasswordHaveLoggedIn))
    return router
}
