import Group from "../models/group.model.js";
import { uploadMultipleToCloudinary } from "../utils/cloudinary.js";

export const getGroupall = async (req, res) => {
  try {
    const items = await Group.find();

    res.status(200).json({
      items,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);

    res.status(500).json({
      error: "Server error, could not fetch groups.",
    });
  }
};

export const addGroup = async (req, res) => {
  try {
    console.log("=================================");
    console.log("ADD GROUP BACKEND");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("=================================");

    // Check WhatsApp number
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({
        error: "WhatsApp number is required.",
      });
    }

    // Check uploaded file
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "Payment screenshot is required.",
      });
    }

    console.log("WhatsApp number:", number);
    console.log("Number of files:", req.files.length);

    // ==========================================
    // SELECT CLOUDINARY ACCOUNT
    // ==========================================

    const account = 1;

    console.log("Using Cloudinary account:", account);

    // Upload image
    const imageUrls = await uploadMultipleToCloudinary(
      req.files.map((file) => file.path),
      account
    );

    console.log("Cloudinary image URLs:", imageUrls);

    if (!imageUrls || imageUrls.length === 0) {
      return res.status(500).json({
        error: "Image upload failed.",
      });
    }

    // ==========================================
    // SAVE GROUP REQUEST
    // ==========================================

    const newGroup = new Group({
      number: number.trim(),
      image1: imageUrls[0],
    });

    await newGroup.save();

    console.log("Group saved successfully:", newGroup);

    res.status(201).json({
      message: "Group request created successfully",
      item: newGroup,
    });
  } catch (error) {
    console.error("=================================");
    console.error("ERROR ADDING GROUP");
    console.error("=================================");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    res.status(500).json({
      error: error.message || "Server error, could not add group.",
    });
  }
};