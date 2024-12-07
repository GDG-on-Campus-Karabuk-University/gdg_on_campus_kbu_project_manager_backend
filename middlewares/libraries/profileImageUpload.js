const multer = require("multer");
const path = require("path");
const CustomError = require("../../helpers/error/CustomError");



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const rootDir = path.dirname(require.main.filename);

        const isTeam = req.params.teamId ? "team_profile_uploads" : "user_profile_uploads";

        cb(null, path.join(rootDir, `/public/uploads/${isTeam}`));
    },
    filename: function(req, file, cb) {

        const extension = file.mimetype.split("/")[1];
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        req.savedProfileImage = "image_" + req.user.id + "." + uniqueSuffix + "." + extension;
        cb(null, req.savedProfileImage);
    }
});

const fileFilter = (req, file, cb) => {
    let allowedMimeTypes = ["image/jpg", "image/gif", "image/jpeg", "image/png"];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new CustomError("Please provide a valid image file", 400), false);
    }
    return cb(null, true);
}

// const profileImageUpload = multer({storage, fileFilter});

const upload = multer({
    storage: storage,
    limit: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
})

module.exports = upload;