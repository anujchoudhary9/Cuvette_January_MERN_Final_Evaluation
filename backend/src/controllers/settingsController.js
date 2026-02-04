const getSettings = (req, res) => {
  res.json({
    message: "Settings endpoint working",
  });
};

module.exports = {
  getSettings,
};
