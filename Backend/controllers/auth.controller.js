import Admin from "../models/admin.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const registerAdmin = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password } = req.body;

    if (!fullname || !email || !phoneNumber || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const existingUser = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Admin.create({
      fullname,
      email: email.toLowerCase(),
      phoneNumber,
      password: hashedPassword,
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.log("Error in registration:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    let user = await Admin.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const userData = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: `${user.fullname} logged in successfully`,
        user: userData,
        success: true,
      });
  } catch (error) {
    console.log("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "User logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// PROFILE
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId).select("-password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
        success: false,
      });
    }

    return res.status(200).json({
      admin,
      success: true,
    });
  } catch (error) {
    console.log("Profile error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
