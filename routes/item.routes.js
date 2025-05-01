import express from 'express';
import {
  getItems,
  addItem,
  updateItem,
  deleteItem,
  getItem,
  getItemsByCategory,
  getfreeItem,
  updateItemfree,
  getItemsBySearch,
} from '../controllers/item.controller.js'; // Adjust the path as necessary
import { upload, handleMulterError } from '../middlewares/multer.middleware.js'; // Adjust the path as necessary

const router = express.Router();

// Route to fetch all items
router.get('/', getItems);

router.get('/category/:categoryName', getItemsByCategory);

router.get('/search/:query', getItemsBySearch);

router.get('/free', getfreeItem );

// Route to fetch a single item by ID
router.get('/:lname', getItem);

// Route to add a new item with image uploads
router.post('/add', upload, handleMulterError, addItem);

router.put('/setfree/:id', updateItemfree);
// Route to update an existing item by ID with image uploads
router.put('/:id', upload, handleMulterError, updateItem);

// Route to delete an item by ID
router.delete('/:id', deleteItem);

export default router;
