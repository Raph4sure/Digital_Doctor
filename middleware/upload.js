const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads"); // Files will be stored in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`); // Generates unique filenames
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB max size per file
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(
                new Error(
                    "Invalid file type. Only JPEG, JPG, PNG files are allowed"
                ),
                false
            ); // Reject the file
        }
    },
});

// Export the upload function to handle multiple file uploads
module.exports = (fieldName, maxFiles) => upload.array(fieldName, maxFiles);
