import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    number: { type: String, required: true },
    image1: { type: String }, // URL for image 1
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
export default Group;