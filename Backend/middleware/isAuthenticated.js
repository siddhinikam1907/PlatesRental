import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized, token not found",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized, invalid token",
        success: false,
      });
    }

    // ✅ FIX: consistent naming
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.log("Error in authentication middleware:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export default isAuthenticated;
