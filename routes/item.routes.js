import express from 'express';
import {
  getItems,
  getItemsall,
  addItem,
  updateItem,
  deleteItem,
  getItem,
  getItemsByCategory,
  getItemsByCategoryall,
  getfreeItem,
  updateItemfree,
  getItemsBySearch,
  getItemsBySearchall,
  getItemsallol, 
  incrementViews, 
  toggleLike,
  addComment,
  getComments
} from '../controllers/item.controller.js'; // Adjust the path as necessary
import { upload, handleMulterError } from '../middlewares/multer.middleware.js'; // Adjust the path as necessary

const router = express.Router();

// Route to fetch all items
router.get('/', getItems);

router.get('/all', getItemsall);

router.get('/category/:categoryName', getItemsByCategory);

router.get('/categoryall/:categoryName', getItemsByCategoryall);

router.get('/search/:query', getItemsBySearch);

router.get('/searchall/:query', getItemsBySearchall);

router.get('/free', getfreeItem );

// Main route - get all movies with online links
router.get('/movies', getItemsallol);
// Interaction routes
router.put('/movie/:movieId/view', incrementViews);
router.put('/movie/:movieId/like', toggleLike);
router.post('/movie/:movieId/comment', addComment);
router.get('/movie/:movieId/comments', getComments);

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
