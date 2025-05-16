let availability = 'Accepting';

const getAvailability = (req, res) => {
  res.json({ availability });
};

const setAvailability = (req, res) => {
  const { mode } = req.body;
  if (mode !== 'Accepting' && mode !== 'Busy') {
    return res.status(400).json({ error: 'Invalid mode' });
  }
  availability = mode;
  req.app.get('io').emit('availabilityChanged', { availability });
  res.json({ availability });
};

module.exports = { getAvailability, setAvailability };
