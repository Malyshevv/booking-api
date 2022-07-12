
import express from 'express';
import { postsController } from '../../controllers';

export const router = express.Router({
    strict: true
});

router.get('/', (req, res) => {
    postsController.readAll(req, res);
});

router.get('/:id', (req, res) => {
    postsController.read(req, res);
});

router.post('/update', (req, res) => {
    postsController.update(req, res);
});


router.post('/create', (req, res) => {
    postsController.create(req, res);
});
