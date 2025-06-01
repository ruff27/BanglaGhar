const { validationResult } = require("express-validator");

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
   
    console.error("Validation Errors:", errors.array());
    
    return res.status(400).json({ errors: errors.array() });
  }
  next(); 
};
