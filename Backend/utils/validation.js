const Joi = require('joi');

exports.registerSchema = Joi.object({

    name:Joi.string().min(3).max(30).required(),
    email:Joi.string().email().required(),
    password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])"))
    .message(
      "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
    )
    .required(),
    role:Joi.string().valid('student', 'tutor').required(),
});
