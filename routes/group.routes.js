import express from 'express';
import {

  getGroupall,
  addGroup,

} from '../controllers/group.controller.js'; // Adjust the path as necessary
import { upload, handleMulterError } from '../middlewares/multer.middleware.js'; // Adjust the path as necessary

const router = express.Router();

router.get('/all', getGroupall);


router.post('/add', upload, handleMulterError, addGroup);

export default router;