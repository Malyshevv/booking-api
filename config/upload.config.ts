import multer from 'multer';
import {v4 as uuidv4} from 'uuid';
import path from "path";
import fs from "fs";

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

export async function uploadImage(file) {
    let uploadPath;
    let result;

    let typeFile = file.mimetype.split('/')[1]

    let fileName = uuidv4().toString().replace(/-/g, '') + '.' + typeFile;
    uploadPath = path.resolve(__dirname, `../public/upload/avatar/${fileName}`);

    if (!fs.existsSync(path.resolve(__dirname, '../public/upload/'))) {
        await fs.promises.mkdir(path.resolve(__dirname, '../public/upload'), {recursive: true}).catch(err => {
            throw err;
        });
    }

    if (!fs.existsSync(path.resolve(__dirname, '../public/upload/avatar'))) {
        await fs.promises.mkdir(path.resolve(__dirname, '../public/upload/avatar'), {recursive: true}).catch(err => {
            throw err;
        });
    }

    file.mv(uploadPath, function(err) {
        if (err) {
            return false
        }

    });

    result = {
        fileName: fileName,
        path: uploadPath
    }

    return result;
}

export async function deleteImage(data) {
    let pathName = `${data.path}${data.fileName}`;
    return fs.promises.unlink(pathName)
        .then((res) => console.log(res))
        .catch((err) => {
            console.log('error delete file - ' + err);
            return false;
        })
}
