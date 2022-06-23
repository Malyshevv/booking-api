import express from 'express';
import { authController } from '../../controllers';

export const router = express.Router({
    strict: true
});


router.post('/signup', (req,res) => {
    return authController.create(req, res);
})

router.post('/signing', (req,res) => {
    return authController.read(req, res);
})

router.get('/logout', async (req, res) => {
    return authController.delete(req, res);
});


