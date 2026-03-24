import Customer from "../models/customer.model.js";

// Create Customer
export const createCustomer = async (req, res) => {
  try {
    const { customerName, phoneNumber, location, siteLocation } = req.body;

    if (!customerName || !phoneNumber || !location || !siteLocation) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const existingCustomer = await Customer.findOne({ phoneNumber });

    if (existingCustomer) {
      return res.status(400).json({
        message: "Customer already exists with this phone number",
        success: false,
      });
    }

    const customer = await Customer.create({
      customerName,
      phoneNumber,
      location,
      siteLocation,
    });

    return res.status(201).json({
      message: "Customer created successfully",
      success: true,
      customer,
    });
  } catch (error) {
    console.log("Error creating customer:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get All Customers
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ isDeleted: false }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    console.log("Error fetching customers:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get Customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
        success: false,
        x,
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.log("Error fetching customer:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    if (!updatedCustomer) {
      return res.status(404).json({
        message: "Customer not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Customer updated successfully",
      success: true,
      updatedCustomer,
    });
  } catch (error) {
    console.log("Error updating customer:", error);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Delete Customer
export const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id; // matches your route

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // soft delete
    customer.isDeleted = true;
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer marked as deleted, rentals preserved",
    });
  } catch (error) {
    console.log("Error deleting customer:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
