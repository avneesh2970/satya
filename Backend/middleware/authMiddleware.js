const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token verification failed"
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (err) {
      console.error("Optional auth failed:", err);
    }
  }
  next();
};

const protectPhysio = async (req, res, next) => {
  return protect(req, res, () => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access physio dashboard"
      });
    }

    if (req.user.role !== "physio" && req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: Physio role required"
      });
    }

    if (req.user.role === "physio" || (req.user.role === "doctor" && req.user.approvalStatus === "PENDING")) {
      if (req.user.role === "physio" && req.user.registrationStatus === "INCOMPLETE") {
        return res.status(403).json({
          success: false,
          code: "REGISTRATION_INCOMPLETE",
          message: "Professional registration is incomplete",
          registrationStatus: req.user.registrationStatus,
          approvalStatus: req.user.approvalStatus
        });
      }

      if (req.user.approvalStatus !== "APPROVED" || req.user.isApproved !== true) {
        return res.status(403).json({
          success: false,
          code: req.user.approvalStatus === "REJECTED" ? "REGISTRATION_REJECTED" : "APPROVAL_PENDING",
          message: req.user.approvalStatus === "REJECTED"
            ? `Registration rejected: ${req.user.rejectionReason || "No reason specified"}`
            : "Your account is awaiting admin approval",
          registrationStatus: req.user.registrationStatus,
          approvalStatus: req.user.approvalStatus,
          rejectionReason: req.user.rejectionReason
        });
      }
    }

    next();
  });
};

const protectAdmin = async (req, res, next) => {
  return protect(req, res, () => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access admin portal"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: Admin role required"
      });
    }

    next();
  });
};

module.exports = { protect, optionalAuth, protectPhysio, protectAdmin };
