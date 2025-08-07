// controllers/uploadController.js
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

export const uploadImageToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'image',
    });

    // Remove file from local storage after uploading
    fs.unlinkSync(localFilePath);

    return response.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
