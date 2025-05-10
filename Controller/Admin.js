
const Admin = require('../Models/Admin');
const Coupon = require('../Models/Coupon');
const Menu = require('../Models/Menu');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const planSchema = require('../Models/Plans')
const WeeklyMenu = require('../Models/Menu');
const PaymentOrder = require('../Models/PaymentOrder');
const sendEmail = require('../notificationServices/SendEmail');
const mongoose = require('mongoose');
const User = require('../Models/User');
const DeliveryAddress = require('../Models/DeliveryAddress');
const PlansTransaction = require('../Models/PlansTransaction');
const AddMenu = async (req, res) => {
   
  try {
      const data = req.body;
      console.log(data['sunday'].breakfast[0])
      if (data['sunday'].breakfast[0] !== 'monu') {
        return res.status(400).json({ error: 'You are not authorized' });
      }

      // Extract name and description from the request body
      const { name, description } = data;
      
      // Validate required fields
      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required fields' });
      }

      // Convert each dish name into { name: <string> } format
      const formattedMenu = {
        name,
        description
      };
      
      for (const day in data) {
          if (day === 'sunday' || day === 'name' || day === 'description'){
              continue;
          }
          
          formattedMenu[day] = {
            breakfast: data[day].breakfast.map(name => ({ name })),
            lunch: data[day].lunch.map(name => ({ name })),
            dinner: data[day].dinner.map(name => ({ name }))
          };
      }
  
      const newMenu = new Menu(formattedMenu);
      await newMenu.save();
      res.status(200).json({ 
        success: true,
        message: 'Menu saved successfully.',
        menuId: newMenu._id 
      });
    } catch (error) {
      console.error('Error saving menu:', error);
      res.status(500).json({ success: false, error: 'Internal server error.' });
    }
};


const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return token in JSON response
    return res.status(200).json({
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const Register = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if admin already exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newUser = new Admin({
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newUser.save();

    // Optionally return a JWT token after registration
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const GetMenu = async (req, res) => {


    try {
        const menu = await Menu.find({});
        if (!menu) {
            return res.status(404).json({ message: 'Menu not found' });
        }
        res.status(200).json(menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



const addPlan = async (req, res) => {
  try {
    // Get data from the request body
    const { name, price, discount, menu, period, isCoupon, thumbnail, isHome } = req.body;

    // Validation check for required fields
    if (!name || !price || !menu) {
      return res.status(400).json({ success: false, msg: 'Name, price, and menu are required.' });
    }

    // Create a new plan
    const newPlan = new planSchema({                     
      name,
      price,
      discount: discount || 0, // Default discount to 0 if not provided
      menu,
      period: period || 30, // Default period to 30 if not provided
      isCoupon: isCoupon || "false",
      thumbnail: thumbnail || "#",
      isHome: isHome || false
    });

    // Save the plan to the database
    const savedPlan = await newPlan.save();
    console.log('Plan added successfully');
    
    // Send response
    res.status(200).json({ 
      success: true, 
      msg: 'Plan added successfully', 
      plan: savedPlan 
    });
    
  } catch (error) {
    console.error('Error adding plan:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to add plan', 
      error: error.message 
    });
  }
};

const getPlans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Create search query
    const searchQuery = search 
      ? { name: { $regex: search, $options: 'i' } } 
      : {};
    
    // Find plans with search and pagination
    const plans = await planSchema.find(searchQuery)
      .populate('menu', 'name') // Populate menu reference with just the name
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalPlans = await planSchema.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalPlans / limit);
    
    res.status(200).json({
      success: true,
      plans,
      currentPage: page,
      totalPages,
      totalPlans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plans',
      error: error.message
    });
  }
};


const EditPlan = async (req,res)=>{
  try {
    const planId = req.params.id;
    
    // Verify that the plan exists
    const existingPlan = await planSchema.findById(planId);
    
    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    // Extract updated data from request body
    const {
      name,
      price,
      thumbnail,
      discount,
      period,
      isCoupon,
      menu,
      isHome
    } = req.body;
    
    // Create update object with validated data
    const updateData = {};
    
    // Only include fields that are provided in the request
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (discount !== undefined) updateData.discount = discount;
    if (period !== undefined) updateData.period = period;
    if (isCoupon !== undefined) updateData.isCoupon = isCoupon;
    if (menu !== undefined) updateData.menu = menu;
    if (isHome !== undefined) updateData.isHome = isHome;
    
    // Update the plan with new data
    const updatedPlan = await planSchema.findByIdAndUpdate(
      planId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      plan: updatedPlan
    });
    
  } catch (error) {
    console.error('Error updating plan:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while updating plan',
      error: error.message
    });
  }
}

const DeletePlan = async (req,res)=>{
  try {
    const planId = req.params.id;
    
    // Check if plan exists
    const plan = await planSchema.findById(planId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    // Delete the plan
    await planSchema.findByIdAndDelete(planId);
    
    return res.status(200).json({
      success: true,
      message: 'Plan deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting plan:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting plan',
      error: error.message
    });
  }
}


const getWeeklyMenus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    
    const searchQuery = search 
      ? { name: { $regex: search, $options: 'i' } } 
      : {};
    
    const totalMenus = await WeeklyMenu.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalMenus / limit);
    
    const menus = await WeeklyMenu.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json({
      menus,
      totalPages,
      currentPage: page,
      totalMenus
    });
  } catch (error) {
    console.error('Error fetching weekly menus:', error);
    res.status(500).json({ message: 'Failed to fetch weekly menus' });
  }
};




// Update a weekly menu
const editWeeklyMenu = async (req, res) => {
  try {
    const { name, description, monday, tuesday, wednesday, thursday, friday, saturday } = req.body;
    
    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }
    
    const updatedMenu = await WeeklyMenu.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        monday,
        tuesday,
        wednesday, 
        thursday,
        friday,
        saturday
      },
      { new: true }
    );
    
    if (!updatedMenu) {
      return res.status(404).json({ message: 'Weekly menu not found' });
    }
    
    res.status(200).json({
      message: 'Weekly menu updated successfully',
      menu: updatedMenu
    });
  } catch (error) {
    console.error('Error updating weekly menu:', error);
    res.status(500).json({ message: 'Failed to update weekly menu' });
  }
};

// Delete a weekly menu
const deleteWeeklyMenu = async (req, res) => {
  try {
    const deletedMenu = await WeeklyMenu.findByIdAndDelete(req.params.id);
    
    if (!deletedMenu) {
      return res.status(404).json({ message: 'Weekly menu not found' });
    }
    
    res.status(200).json({
      message: 'Weekly menu deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting weekly menu:', error);
    res.status(500).json({ message: 'Failed to delete weekly menu' });
  }
};


const GetWalletTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { order_status: 'FAILED' }; // We only want failed transactions
    
    // Apply claim status filter if provided
    if (req.query.claimStatus) {
      filter.claim_status = req.query.claimStatus;
    }
    
    // Apply date filters if provided
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      
      if (req.query.endDate) {
        // Set end date to the end of the day
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }
    
    // Get total count of documents matching the filter
    const totalCount = await PaymentOrder.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    
    // Fetch transactions with pagination
    const transactions = await PaymentOrder.find(filter)
      .populate('customer_id', 'firstName email phone') // Populate customer details
      .sort({ createdAt: -1 }) // Sort by latest first
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      transactions,
      currentPage: page,
      totalPages,
      totalCount,
      limit
    });
    
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet transactions',
      error: error.message
    });
  }
};


const verifyAdminPassword = async (adminPassword,adminId) => {
  
  console.log(adminId)
  const admin = await Admin.findOne({ _id: new mongoose.Types.ObjectId(adminId) } );
console.log(admin)
  if (!admin) {
   return false
  }

  // Check password
  const isMatch = await bcrypt.compare(adminPassword, admin.password);
  console.log(isMatch)
  if (!isMatch) {
    return {status:false,email:null}; 
  }
  return {status:true,email:admin.email}; 


  }



  const UpdateClaimStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      console.log(req.body);
  
      const adminId = req.adminId;
      const { transactionId, action, comment, adminPassword } = req.body;
  
      // Verify admin credentials
      const isAdmin = await verifyAdminPassword(adminPassword, adminId);
      if (!isAdmin.status) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({
          success: false,
          message: 'Unauthorized action',
        });
      }
      const adminEmail = isAdmin.email;
  
      // Validate action
      const validStatuses = ['Approve', 'Reject'];
      if (!validStatuses.includes(action)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Invalid claim status',
        });
      }
  
      // Find the transaction
      const transaction = await PaymentOrder.findOne(
        { _id: new mongoose.Types.ObjectId(transactionId) },
        null,
        { session }
      );
      if (transaction.isClaimApproved) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Claim already approved',
        });
      }

      if (!transaction) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }
  
      const customer = await User.findOne(
        { _id: new mongoose.Types.ObjectId(transaction.customer_id) },
        null,
        { session }
      );
      if (!customer) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }
  
      const amount = transaction.order_amount;
  
      // Update claim status
      if (action === 'Approve') {
        transaction.claim_status = 'Payment completed';
      } else if (action === 'Reject') {
        transaction.claim_status = 'Payment rejected';
      }
  
      customer.walletbalance += amount;
  
      transaction.isClaimed = false; // Mark as claimed
      transaction.order_status = 'SUCCESS';
      transaction.isClaimApproved = true; // Mark as claim approved
      // Save both documents inside the transaction
      await customer.save({ session });
      await transaction.save({ session });
  
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
  
      // After committing transaction, send email (email failure shouldn't affect database consistency)
      sendEmail(
        customer.email,
        'Claim Status Update',
        `Your claim status has been updated to: ${action}. Comment: ${comment}`,
        '',
        process.env.CEO_EMAIL,
        process.env.CEO_EMAILSMTPGOOGLEKEY
      );
  
      res.status(200).json({
        success: true,
        message: 'Claim status updated successfully',
        transaction,
      });
  
    } catch (error) {
      console.error('Error updating claim status:', error);
  
      // Rollback any changes made in the transaction
      await session.abortTransaction();
      session.endSession();
  
      res.status(500).json({
        success: false,
        message: 'Failed to update claim status',
        error: error.message,
      });
    }
  };


  const getUsers = async (req, res) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || 10;
      const skip = (page - 1) * limit;
  
      const filter = {};
  
      if (req.body.by !== '') {
        const searchTerm = req.body.term.trim();
        const regex = new RegExp(searchTerm, 'i'); // Case-insensitive regex
      
        switch (req.body.by) {
          case 'name':
            // Correctly handle full name search
            filter.$or = [
              { firstName: regex },
              { lastName: regex },
              // The following approach won't work properly in MongoDB
              // { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: searchTerm, options: "i" } } }
            ];
            
            // For full name search, we need to use aggregation or split the search term
            // Check if the search term contains a space (possible first+last name)
            if (searchTerm.includes(' ')) {
              const [firstPart, ...restParts] = searchTerm.split(' ');
              const lastPart = restParts.join(' ');
              
              // Add a condition that matches firstName with first part AND lastName with last part
              filter.$or.push({
                $and: [
                  { firstName: new RegExp(firstPart, 'i') },
                  { lastName: new RegExp(lastPart, 'i') }
                ]
              });
            }
            break;
          case 'email':
            filter.email = regex;
            break;
          case 'phone':
            filter.phone = regex;
            break;
          default:
            // Search across multiple fields
            filter.$or = [
              { firstName: regex },
              { lastName: regex },
              { email: regex },
              { phone: regex }
            ];
            break;
        }
      }
  console.log(filter)
      const users = await User.find(filter)
        .select('firstName lastName email phone createdAt role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
  
      const total = await User.countDocuments(filter);
  
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
  
      const formattedUsers = users.map(user => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        joinDate: new Date(user.createdAt).toLocaleDateString('en-US'),
        id: user._id
      }));
  
      res.status(200).json({
        success: true,
        data: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
  };


  const getTransactionOrders = async (req, res) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Build search filter
      const filter = {};
      
      if (req.body.search && req.body.searchBy) {
        const searchTerm = req.body.search.trim();
        
        switch (req.body.searchBy) {
          case 'orderId':
            // Case-insensitive search for order_id
            filter.order_id = new RegExp(searchTerm, 'i');
            break;
            
          case 'customerId':
            // If the search term is a valid ObjectId, use it directly
            if (mongoose.isValidObjectId(searchTerm)) {
              filter.customer_id =new mongoose.Types.ObjectId(searchTerm);
            } else {
              // Return empty result if invalid ObjectId for customer search
              return res.status(200).json({
                success: true,
                data: [],
                pagination: {
                  page,
                  limit,
                  total: 0,
                  totalPages: 0,
                  hasNextPage: false,
                  hasPrevPage: false
                }
              });
            }
            break;
            
          default:
            // If no specific search field is provided or invalid field
            // Search in both fields if the term might be an ObjectId
            if (mongoose.isValidObjectId(searchTerm)) {
              filter.$or = [
                { order_id: new RegExp(searchTerm, 'i') },
                { customer_id:new mongoose.Types.ObjectId(searchTerm) }
              ];
            } else {
              // Just search by order_id if not a valid ObjectId
              filter.order_id = new RegExp(searchTerm, 'i');
            }
            break;
        }
      }
  
      // Perform the find operation with population of customer details
      const transactions = await PaymentOrder.find(filter)
        .populate('customer_id', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
  
      // Get total count for pagination
      const total = await PaymentOrder.countDocuments(filter);
      
      // Calculate pagination details
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
  
      // Format transactions for response
      const formattedTransactions = transactions.map(transaction => ({
        ...transaction,
        customerName: transaction.customer_id ? 
          `${transaction.customer_id.firstName} ${transaction.customer_id.lastName}`.trim() : 
          'Unknown Customer',
        customerEmail: transaction.customer_id ? transaction.customer_id.email : '',
        customerPhone: transaction.customer_id ? transaction.customer_id.phone : '',
        transactionDate: new Date(transaction.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        // Keep the original customer_id for reference but also include formatted id
        customerId: transaction.customer_id ? transaction.customer_id._id : null
      }));
  
      // Send successful response
      res.status(200).json({
        success: true,
        data: formattedTransactions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      });
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error.message
      });
    }
  };


  const getUserActivityHistory = async (req, res) => {
    try {
      const userId = req.query.id;
  console.log(userId)
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
  
      // Get user details
      const user = await User.findById(userId).lean();
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      // Format basic user info
      const userInfo = {
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone,
        gender: user.gender || 'Not specified',
        dob: user.dob ? new Date(user.dob).toLocaleDateString() : 'Not specified',
        status: user.status,
        walletBalance: user.walletbalance,
        country: user.country,
        registrationDate: new Date(user.createdAt).toISOString(),
        image: user.image
      };
  
      // Get all delivery addresses
      const addresses = await DeliveryAddress.find({ user_id: userId }).lean();
  
      // Get all payment orders
      const paymentOrders = await PaymentOrder.find({ customer_id: userId }).lean();
      
      // Get all plan transactions with populated plan details
      const planTransactions = await PlansTransaction.find({ user_id: userId })
        .populate('plan_id', 'name description price duration')
        .populate('address_id')
        .lean();
  
      // Combine all activities into a single timeline
      const activities = [];
  
      // Add registration as first activity
      activities.push({
        type: 'registration',
        date: new Date(user.createdAt),
        timestamp: user.createdAt,
        details: {
          message: 'User registered',
          email: user.email
        }
      });
  
      // Add all addresses with creation dates
      addresses.forEach(address => {
        activities.push({
          type: 'address_added',
          date: new Date(address.createdAt),
          timestamp: address.createdAt,
          details: {
            address_id: address._id,
            address: address.address,
            receiver: address.recievers_name,
            isDefault: address.isDefault
          }
        });
      });
  
      // Add all payment orders
      paymentOrders.forEach(order => {
        activities.push({
          type: 'payment',
          date: new Date(order.createdAt),
          timestamp: new Date(order.createdAt).getTime(),
          details: {
            order_id: order.order_id,
            amount: order.order_amount,
            currency: order.order_currency,
            status: order.order_status,
            claim_status: order.claim_status,
            _id: order._id
          }
        });
      });
  
      // Add all plan transactions
      planTransactions.forEach(transaction => {
        activities.push({
          type: 'plan_subscription',
          date: new Date(transaction.createdAt),
          timestamp: new Date(transaction.createdAt).getTime(),
          details: {
            plan_name: transaction.plan_id?.name || 'Unknown Plan',
            plan_price: transaction.plan_id?.price || transaction.amount,
            amount_paid: transaction.amount,
            expiry_date: new Date(transaction.expiringAt).toISOString(),
            delivery_address: transaction.address_id ? 
              `${transaction.address_id.recievers_name}, ${transaction.address_id.address}` :
              'Address not available',
            paused_dates: transaction.pausedDates || [],
            _id: transaction._id
          }
        });
      });
  
      // Sort all activities by date (newest first)
      activities.sort((a, b) => b.timestamp - a.timestamp);
  
      res.status(200).json({
        success: true,
        data: {
          user: userInfo,
          addresses: addresses,
          activities: activities
        }
      });
  
    } catch (error) {
      console.error('Error fetching user activity history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user activity history',
        error: error.message
      });
    }
  };
module.exports = {AddMenu,Login,Register,GetMenu,addPlan,getPlans,EditPlan,DeletePlan,getWeeklyMenus,editWeeklyMenu,deleteWeeklyMenu,GetWalletTransactions,UpdateClaimStatus,getUsers,getTransactionOrders,getUserActivityHistory};
