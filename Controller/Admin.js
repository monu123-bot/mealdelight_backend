
const Coupon = require('../Models/Coupon');
const Menu = require('../Models/Menu');
const AddMenu = async (req, res) => {
   

    try {
        const data = req.body;
        console.log(data['sunday'].breakfast[0])
        if (data['sunday'].breakfast[0] !== 'monu') {
          return res.status(400).json({ error: 'You are not authorized' });
        }

        // Convert each dish name into { name: <string> } format
        const formattedMenu = {};
        for (const day in data) {
            if (day=='sunday'){
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
        res.status(200).json({ message: 'Menu saved successfully.' });
      } catch (error) {
        console.error('Error saving menu:', error);
        res.status(500).json({ error: 'Internal server error.' });
      }
};

  module.exports = {AddMenu};
