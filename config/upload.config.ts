import multer from 'multer';
import {v4 as uuidv4} from 'uuid';

export function uploadConfig(dir) {

    if (!dir) {
        return {error: 'Required dir path'};
    }

    const storageConfig = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            file = `${uuidv4()}.${file.mimetype.split('/')[1]}`;

            cb(null, file);
        }
    });
    const fileFilter = (req, file, cb) => {

        if (file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }

    return multer({storage: storageConfig, fileFilter: fileFilter});
}
