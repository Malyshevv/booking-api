import express from 'express';
import { usersController } from '../../controllers';

export const router = express.Router({
    strict: true
});

router.get('/',  (req,res) => {
    usersController.readAll(req, res);
})

router.get('/:id',  (req,res) => {
    usersController.read(req, res);
})

router.put('/update/:id', (req,res) => {
    usersController.update(req, res);
})


