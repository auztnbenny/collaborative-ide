import express, { Request, Response } from "express";
import User from "../models/User";

const router = express.Router();

router.post("/saveUser", async (req: Request, res: Response) => {
  console.log("Received request body:", JSON.stringify(req.body, null, 2));

  try {
    const { clerkId, email, username, firstName, lastName } = req.body;

    // Validate required fields
    if (!clerkId || !email) {
      return res.status(400).json({
        message: "ClerkId and email are required",
        receivedData: req.body
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(200).json({
        message: "User already exists",
        user: existingUser
      });
    }

    // Create new user
    const newUser = new User({
      clerkId,
      email,
      username: username || null,
      firstName: firstName ||  null,
      lastName: lastName || null
    });

    const savedUser = await newUser.save();

    console.log("User saved successfully:", savedUser);

    res.status(201).json({
      message: "User saved successfully",
      user: {
        id: savedUser._id,
        clerkId: savedUser.clerkId,
        email: savedUser.email
      }
    });
  } catch (error: any) {
    console.error("Error in /saveUser route:", {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists",
        error: error.message
      });
    }

    res.status(500).json({
      message: "Error saving user",
      error: error.message
    });
  }
});

export default router;