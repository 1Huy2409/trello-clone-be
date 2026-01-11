import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { LoginResponseSchema, PostLogin, PostRegister, PostRequestOTP, PostResetPassword, PostResetPasswordHaveLoggedIn, PostVerifyOTP, RequestOTPResponseSchema, ResetPasswordResponseSchema, VerifyOTPResponseSchema, ChangePasswordRequest } from "./schemas/auth.schema";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilder";
import z from "zod";

export const authRegistry = new OpenAPIRegistry();
export function registerAuthPaths() {
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/login',
        tags: ['Auth'],
        request: { body: PostLogin },
        responses: createApiResponse(LoginResponseSchema, 'Success')
    })
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/register',
        tags: ['Auth'],
        request: { body: PostRegister },
        responses: createApiResponse(RequestOTPResponseSchema, 'Success')
    })
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/forgot-password/request',
        tags: ['Auth'],
        request: { body: PostRequestOTP },
        responses: createApiResponse(RequestOTPResponseSchema, 'Success')
    })
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/forgot-password/verify',
        tags: ['Auth'],
        request: { body: PostVerifyOTP },
        responses: createApiResponse(VerifyOTPResponseSchema, 'Success')
    })
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/forgot-password/reset',
        tags: ['Auth'],
        request: { body: PostResetPassword },
        responses: createApiResponse(ResetPasswordResponseSchema, 'Success')
    })
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/verify-otp',
        tags: ['Auth'],
        request: { body: PostVerifyOTP },
        responses: createApiResponse(VerifyOTPResponseSchema, 'Success')
    })
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/logout',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(z.null(), 'Success')
    })
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/processNewToken',
        tags: ['Auth'],
        responses: createApiResponse(z.null(), 'Success')
    })
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/reset',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        request: { body: PostResetPasswordHaveLoggedIn },
        responses: createApiResponse(ResetPasswordResponseSchema, 'Success')
    })
    authRegistry.registerPath({
        method: 'get',
        path: '/api/v1/auth/verify',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: createApiResponse(z.object({ valid: z.boolean() }), 'Success')
    })
    authRegistry.registerPath({
        method: 'post',
        path: '/api/v1/auth/change-password',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        request: { body: ChangePasswordRequest },
        responses: createApiResponse(ResetPasswordResponseSchema, 'Success')
    })
}