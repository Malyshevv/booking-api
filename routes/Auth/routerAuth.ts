import express from 'express';
import { authController } from '../../controllers';

export const router = express.Router({
    strict: true
});


router.post('/signup', (req,res) => {
    authController.create(req, res);
})

router.post('/signing', (req,res) => {
    authController.read(req, res);
})

router.post('/logout', async (req, res) => {
    authController.delete(req, res);
});


