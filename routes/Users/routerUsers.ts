import express from 'express';
import { usersController } from '../../controllers';
import {uploadConfig} from "../../config/upload.config";
import path from "path";
/* FOR UPLOAD*/
const uploads = uploadConfig(path.resolve(__dirname, '../../public/img/users'));


export const router = express.Router({
    strict: true
});

router.get('/',  (req,res) => {
    usersController.readAll(req, res);
})

router.get('/:id',  (req,res) => {
    usersController.read(req, res);
})

router.post('/update', uploads.single('avatar'), (req,res) => {
    //let uploadConf = uploadConfig(req, path.resolve(__dirname, '../../public/img/users'), true);
    usersController.update(req, res);
})


