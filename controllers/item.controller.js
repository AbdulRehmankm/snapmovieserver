import Item from '../models/item.model.js'; // Adjust the path according to your project structure
import Category from '../models/category.model.js';
import { uploadMultipleToCloudinary } from '../utils/cloudinary.js'; // Ensure the correct import for your upload functions

export const getItems = async (req, res) => {
  try {
    const items = await Item.find().populate('category'); // Adjust as necessary
    res.status(200).json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Server error, could not fetch items.' });
  }
};


export const getItem = async (req, res) => {
  try {
    const { lname } = req.params;
    const item = await Item.findOne({ linkname: { $regex: lname, $options: 'i' } });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.popularity= item.popularity + 1;
    await item.save();
    res.status(200).json({ item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Server error, could not fetch item.' });
  }
};

export const getfreeItem = async (req, res) => {
  try {

    const item = await Item.findOne({ isFreeToday: true }).populate('category');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json({ item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Server error, could not fetch item.' });
  }
};
    


export const getItemsByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params; // Get the category name from the request

    // Find the category by name
    const category = await Category.findOne({ name: categoryName });

    // If no category found, return a 404
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Find items that belong to the found category's ObjectId
    const items = await Item.find({ category: category._id });

    // If no items found, return an appropriate message
    if (items.length === 0) {
      return res.status(404).json({ message: 'No items found for this category' });
    }

    res.status(200).json({ message: 'Items fetched successfully', items });
  } catch (error) {
    console.error('Error fetching items by category name:', error);
    res.status(500).json({ message: 'Server error, could not fetch items' });
  }
};

export const getItemsBySearch = async (req, res) => {
  try {
    const { query } = req.params; // Get the search query from the request params

    const items = await Item.find({ name: { $regex: query, $options: 'i' } });


    // If no items found, return an appropriate message
    if (items.length === 0) {
      return res.status(200).json({ message: 'No items found by search', items });
    }

    // Return the found items
    res.status(200).json({ message: 'Items Search successfully', items });
  } catch (error) {
    console.error('Error fetching items by search query:', error);
    res.status(500).json({ message: 'Server error, could not fetch items' });
  }
};


export const addItem = async (req, res) => {
  try {
    // Find the category by name
    const categoryDoc = await Category.findOne({ name: req.body.category });
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Category not found' });
    }
    // Handle image uploads
    const imageUrls = await uploadMultipleToCloudinary(req.files.map(file => file.path));

    const newItem = new Item({
      name: req.body.name,
      linkname: req.body.lname,
      price: req.body.price,
      fullprice: req.body.fullprice,
      rating: req.body.rating,
      releaseDate: req.body.releaseDate,
      type: req.body.type,
      language: req.body.language.split(',').map(lang => lang.trim()), // Assuming languages are sent as a comma-separated string
      availableFormats: req.body.availableFormats.split(',').map(format => format.trim()), // Assuming formats are sent as a comma-separated string
      link480p: req.body.link480p,
      link720p: req.body.link720p,
      link1080p: req.body.link1080p,
      link4k: req.body.link4k,
      category: categoryDoc._id, // Use the ObjectId of the found category
      description: req.body.description,
      image1: imageUrls[0], // Store first image URL
      image2: imageUrls[1], // Store second image URL
      image3: imageUrls[2], // Store third image URL
    });

    await newItem.save();
    res.status(201).json({ message: 'Item created successfully', item: newItem });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Server error, could not add item.' });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;


    // Find the category by name
    const categoryDoc = await Category.findOne({ name: req.body.category });
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Find the existing item to retain the previous images if no new ones are uploaded
    const existingItem = await Item.findById(id);
    if (!existingItem) return res.status(404).json({ message: 'Item not found' });

    // Handle image uploads if any files are provided
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadMultipleToCloudinary(req.files.map(file => file.path));
    }

    // Construct updatedData, conditionally adding fields based on what was provided
    const updatedData = {
      name: req.body.name || existingItem.name,
      linkname: req.body.lname || existingItem.linkname,
      price: req.body.price || existingItem.price,
      fullprice: req.body.fullprice || existingItem.fullprice,
      rating: req.body.rating || existingItem.rating,
      releaseDate: req.body.releaseDate || existingItem.releaseDate,
      type: req.body.type || existingItem.type,
      language: req.body.language
        ? req.body.language.split(',').map(lang => lang.trim())
        : existingItem.language,
      availableFormats: req.body.availableFormats
        ? req.body.availableFormats.split(',').map(format => format.trim())
        : existingItem.availableFormats,
      link480p: req.body.link480p || existingItem.link480,
      link720p: req.body.link720p || existingItem.link720,
      link1080p: req.body.link1080p || existingItem.link1080,
      link4k: req.body.link4k || existingItem.link4k,
      category: categoryDoc._id || existingItem.category,
      description: req.body.description || existingItem.description,
      // Update image URLs only if new images were uploaded, otherwise retain existing ones
      image1: imageUrls[0] || existingItem.image1,
      image2: imageUrls[1] || existingItem.image2,
      image3: imageUrls[2] || existingItem.image3
    };

    // Update the item in the database
    const updatedItem = await Item.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Server error, could not update item.' });
  }
};


export const updateItemfree = async (req, res) => {
  try {
    const { id } = req.params;
    const existingItem = await Item.findById(id);
    if (!existingItem) return res.status(404).json({ message: 'Item not found' });
    let pp;
    const isfree = !existingItem.isFreeToday;
    if(isfree)
    {
      pp = 0;
    }
    else
    {
      pp=existingItem.fullprice;
      pp=pp/10;
    }
    const updatedData = {
      isFreeToday: isfree,
      price: pp,
    };
   

    const updatedItem = await Item.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json({ message: 'free Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Error updating free item:', error);
    res.status(500).json({ error: 'Server error, could not update free item.' });
  }
};


export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await Item.findByIdAndDelete(id);
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Server error, could not delete item.' });
  }
};
