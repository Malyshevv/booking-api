import express from 'express';
import { authController } from '../../controllers';

export const router = express.Router({
    strict: true
});


router.post('/signup/:email&:password&:username', (req,res) => {
    return authController.create(req, res);
})

router.post('/signing/:email&:password', (req,res) => {
    return authController.read(req, res);
})

router.post('/logout',(req, res) => {
    return authController.delete(req, res);
});


