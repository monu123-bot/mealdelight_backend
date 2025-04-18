// GenerateKetoMeal.js

const GenerateKetoMeal = async (req, res) => {
  try {
    const url = new URL('https://keto-diet.p.rapidapi.com/');
    url.searchParams.append('protein_in_grams__lt', '15');
    url.searchParams.append('protein_in_grams__gt', '5');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'keto-diet.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Error fetching data from RapidAPI:', error.message);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
};

module.exports = { GenerateKetoMeal };
