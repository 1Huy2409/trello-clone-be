import { email, z } from 'zod'
import { UserResponseSchema } from '@/apis/user/schemas';
import { extendZodWithOpenApi, ZodRequestBody } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);
export const LoginResponseSchema = z.object({
    accesstoken: z.string().openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" })
})
export const PostLoginSchema = z.object({
    username: z.string().min(4).max(20).openapi({ example: 'lebao0204' }),
    password: z.string().min(6).max(255).openapi({ example: '@Lebao123' })
})
export const PostLogin: ZodRequestBody = {
    description: 'Login form',
    content: {
        'application/json': {
            schema: PostLoginSchema
        }
    }
}
// password policy: at least 8 chars, one lower, one upper, one digit, one special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const PASSWORD_MESSAGE = 'Password must be at least 8 characters long and include uppercase, lowercase, number and special character.';

export const PostRegisterSchema = z.object({
    fullname: z.string().min(4).max(255).openapi({ example: "Nguyen Huu Nhat Huy" }),
    username: z.string().min(4).max(20).openapi({ example: "username@123" }),
    email: z.email().openapi({ example: "nguyenvana2409@gmail.com" }),
    password: z.string().min(8).max(255).regex(PASSWORD_REGEX, PASSWORD_MESSAGE).openapi({ example: "P@ssw0rd!" })
})
export type RegisterForm = z.infer<typeof PostRegisterSchema>
export const PostRegister: ZodRequestBody = {
    description: 'Register form',
    content: {
        'application/json': {
            schema: PostRegisterSchema
        }
    }
}


export const RequestOTPSchema = z.object({
    email: z.email().openapi({ example: 'nguyenvana2409@gmail.com' })
})
export const PostRequestOTP = {
    content: {
        'application/json': {
            schema: RequestOTPSchema
        }
    }
};
export const RequestOTPResponseSchema = z.object({
    email: z.email(),
    message: z.string()
})
// Step 2: Verify OTP
export const VerifyOTPSchema = z.object({
    email: z.email(),
    otp: z.string().length(6)
});

export const VerifyOTPResponseSchema = z.object({
    email: z.email(),
    message: z.string()
});

export const PostVerifyOTP = {
    content: {
        'application/json': {
            schema: VerifyOTPSchema
        }
    }
};

// Step 3: Complete Registration
export const CompleteRegisterSchema = z.object({
    email: z.email(),
    fullname: z.string().min(1),
    username: z.string().min(3),
    password: z.string().min(8).max(255).regex(PASSWORD_REGEX, PASSWORD_MESSAGE)
});

export const PostCompleteRegister = {
    content: {
        'application/json': {
            schema: CompleteRegisterSchema
        }
    }
};

export type RequestOTPForm = z.infer<typeof RequestOTPSchema>;
export type RequestOTPResponse = z.infer<typeof RequestOTPResponseSchema>;
export type VerifyOTPForm = z.infer<typeof VerifyOTPSchema>;
export type CompleteRegisterForm = z.infer<typeof CompleteRegisterSchema>;

// Forgot password: reset flow
// Reset password after forgot-password verify: only email + newPassword required
export const ResetPasswordSchema = z.object({
    email: z.email(),
    newPassword: z.string().min(8).max(255).regex(PASSWORD_REGEX, PASSWORD_MESSAGE).openapi({ example: 'P@ssw0rd!' })
});
export const PostResetPassword = {
    content: {
        'application/json': {
            schema: ResetPasswordSchema
        }
    }
};

export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(6).max(255).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
    newPassword: z.string().min(8).max(255).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
    confirmNewPassword: z.string().min(8).max(255).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
})
export const ChangePasswordRequest: ZodRequestBody = {
    description: 'Change password form',
    content: {
        'application/json': {
            schema: ChangePasswordSchema
        }
    }
}
export type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;
export type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchemaHaveLoggedIn = z.object({
    email: z.email(),
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8).max(255).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),

});
export const PostResetPasswordHaveLoggedIn = {
    content: {
        'application/json': {
            schema: ResetPasswordSchemaHaveLoggedIn
        }
    }
};
export type ResetPasswordFormHaveLoggedIn = z.infer<typeof ResetPasswordSchemaHaveLoggedIn>;

export const ResetPasswordResponseSchema = z.object({
    email: z.email(),
    user: UserResponseSchema
});
