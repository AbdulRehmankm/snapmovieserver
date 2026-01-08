import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    isAdmin: { type: Boolean, default: false },
    items: [ {
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        language: { type: String, required: true },
        quality: { type: String, required: true },
    } ],
    totalPrice: { type: Number, required: true },
    whnum: { type: String},
    image: { type: String }, 
    status: { type: String, enum: ['pending', 'confirmed', 'delivered', 'cancelled'], default: 'pending' },
    
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
