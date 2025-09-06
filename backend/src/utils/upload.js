import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadImageBufferToCloudinary = (buffer, resourceType = "auto", folder = "messages") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

