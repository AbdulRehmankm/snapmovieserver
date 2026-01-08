import Order from '../models/order.model.js';
import Item from '../models/item.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js'; 


// export const addToCart = async (req, res) => {
//   try {
//     const { item, language, quality, comment, price, token } = req.body;
//     let iorder;
//     if (token) {
//       iorder = await Order.findOne({ _id: token, status: 'pending' });
//     }

//     if (!iorder) {
//       iorder = new Order({
//         items: [{ item, language, quality, comment }],
//         totalPrice: price,
//         status: 'pending',
//       });
//       }
    //  else {
    //   const existingItem = iorder.items.find(
    //     (cartItem) =>
    //       cartItem.item.toString() === item
    //   );
  
      // if (existingItem) {
      //   return res.status(200).json({message: 'Item already exists in the cart'});
      // }
      // else
      // {
          // iorder.items.push({ item, language, quality, comment });
      //}
    
    // }
    // iorder.totalPrice = 0;
    // for (const orderItem of iorder.items) {
    //   const item = await Item.findById(orderItem.item._id);
    //   if (item) {
    //     if (orderItem.quality === "4K") {
    //       iorder.totalPrice = iorder.totalPrice + item.fullprice;
    //     } else {
    //       iorder.totalPrice = iorder.totalPrice + item.price;
    //     }
    //   }
    // }
  
//     const savedOrder = await iorder.save();
//     res.status(200).json({ message: 'Item added to cart', order: savedOrder, token: savedOrder._id });
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     res.status(500).json({ message: 'Internal server error', error });
//   }
// };

export const addToCart = async (req, res) => {
  try {
    const { item, language, quality, comment, price, token } = req.body;

    let iorder = null;

    // Find existing pending order
    if (token) {
      iorder = await Order.findOne({ _id: token, status: "pending" });
    }

    // Create new order if not found
    if (!iorder) {
      iorder = new Order({
        items: [],
        totalPrice: 0,
        status: "pending",
      });
    }

    // ALWAYS push item (same item allowed multiple times)
    iorder.items.push({
      item,
      language,
      quality,
      comment,
    });

    // Increase total price
    iorder.totalPrice += price;

    const savedOrder = await iorder.save();

    res.status(200).json({
      message: "Item added to cart",
      order: savedOrder,
      token: savedOrder._id,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};




export const getUserOrders = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }
 

    const orders = await Order.find({ _id: token }).populate('items.item');
    // const orders = await Order.find({ status: 'pending' }).populate('items.item');
    if (!orders) {
      return res.status(401).json({ message: 'order not provided' });
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }
    // Get the number of items in the first order
    const numberOfItems = orders[0].items.length;
    res.status(200).json({ message: 'Orders fetched successfully', orders, numberOfItems });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};



export const removeItemFromCart = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId).populate('items.item');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Filter out the item to be removed    
    const updatedItems = order.items.filter(itemObj => itemObj.item._id.toString() !== itemId);

    if (updatedItems.length === 0) {
      // If no items left, delete the order
      await Order.findByIdAndDelete(orderId);
      return res.status(200).json({ message: 'Order deleted as no items left in the cart' });
    }

    // Update the items and recalculate the total price
    order.items = updatedItems;
    order.totalPrice = 0;
    
    for (const orderItem of order.items) {
      const item = await Item.findById(orderItem.item._id);
      if (item) {
        if (orderItem.quality === "4K") {
          order.totalPrice = order.totalPrice - item.fullprice;
        } else {
          order.totalPrice = order.totalPrice - item.price;
        }
      }
    }

    const savedOrder = await order.save(); // Save the updated order
    res.status(200).json({ message: 'Item removed from cart successfully', order: savedOrder });
  } catch (error) {
    console.error('Error removing item from cart:', error); // Log error for debugging
    res.status(500).json({ message: 'Error removing item from cart', error });
  }
};




export const checkoutOrder = async (req, res) => {
  const { whhtnum } = req.body;
  const token = req.headers.authorization?.split(' ')[1]; 
  try {
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path); // Upload to Cloudinary only if file exists
    }
    let iorder = await Order.findOne({ _id: token, status: 'pending' });
  
    // let iorder = await Order.findOne({ user: userId, status: 'pending' });
    if (!iorder) {
      return res.status(404).json({ message: 'No pending order found' });
    }
    // Update the order details
    iorder.status = 'confirmed';
    iorder.whnum = whhtnum;
    if (imageUrl) {
      iorder.image = imageUrl; 
    } 

  
    // Save the updated order to the database
    await iorder.save();

    res.status(200).json({ message: 'Order placed successfully', order: iorder });
  } catch (error) {
    // Log and return any error that occurs during the checkout process
    console.error('Error during checkout:', error.message || error);
    res.status(500).json({ error: 'Error during checkout' });
  }
};



export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('items.item');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching order history' });
  }
};

export const setstatus = async (req, res) => {
  try {
    const { status, token } = req.body;
    let iorder;
    if (token) {
      iorder = await Order.findOne({ _id: token });
    }
    iorder.status = status;
    await iorder.save();
    res.status(200).json({ message: 'Item added to cart'});
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};
  
