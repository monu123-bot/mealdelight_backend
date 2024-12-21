const DarkKitchen = require("../Models/DarkKitchen");


const getDarkKitchens = async (req, res) => {
    try {
      const stores = await DarkKitchen.find({}, { name: 1, 'location.coordinates': 1,state:1,city:1,startDate:1, _id: 0 }); // Proper projection for nested fields
      res.status(200).json(stores);
    } catch (error) {
      console.error('Error fetching stores:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  
module.exports = { getDarkKitchens };