import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";
import { BadRequestError, InternalServerError } from "@/common/handler/error.response";

const ACCEPTED_FILE_TYPES = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ensureConfigured = () => {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
        throw new BadRequestError('CLOUDINARY_URL is not configured');
    }
    cloudinary.config({ secure: true }); // uses CLOUDINARY_URL from env
};

export const uploadFile = async (
    file: Express.Multer.File,
    options?: Pick<UploadApiOptions, 'folder' | 'public_id' | 'overwrite' | 'resource_type'>
): Promise<UploadApiResponse> => {
    ensureConfigured();
    // Optional: Allow all types or restrict to a safe list
    if (!ACCEPTED_FILE_TYPES.includes(file.mimetype)) {
        throw new BadRequestError('File type not allowed');
    }

    return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: options?.resource_type || 'auto',
                ...(options?.folder && { folder: options.folder }),
                ...(options?.public_id && { public_id: options.public_id }),
                overwrite: options?.overwrite ?? true,
            },
            (error, result) => {
                if (error || !result) {
                    return reject(new InternalServerError('Failed to upload file to Cloudinary'));
                }
                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
};


export const deleteFile = async (publicId: string, resourceType: string = 'image'): Promise<any> => {
    ensureConfigured();
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
