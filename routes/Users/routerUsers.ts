import express from 'express';
import { usersController } from '../../controllers';

export const router = express.Router({
    strict: true
});

router.get('/',  (req,res) => {
    return usersController.readAll(req, res);
})

router.get('/:id',  (req,res) => {
    return usersController.read(req, res);
})

router.post('/update', (req,res) => {
    return usersController.update(req, res);
})


