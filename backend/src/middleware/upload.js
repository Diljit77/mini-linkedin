import multer from 'multer';

const storage = multer.memoryStorage(); // Use memory for buffer
const upload = multer({ storage });

export default upload;
