
const Admin = require('../Models/Admin');
const Coupon = require('../Models/Coupon');
const Menu = require('../Models/Menu');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const planSchema = require('../Models/Plans')

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

module.exports = {AddMenu,Login,Register,GetMenu,addPlan};
