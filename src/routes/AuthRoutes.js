const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateUserByJwt } = require('../middlewares/JWT');
const ResetPasswordValidationYup = require('../validators/ResetPasswordValidationWithYup');

// Client and Admin Registration
router.post('/signupadmin',AuthController.signUpAdmin);
router.post('/signupuser', AuthController.registerClients);

// Email Verification
router.post('/verifyEmail', AuthController.verifyEmail);

// Login / Logout
router.post('/login', AuthController.login);
router.post('/logout',authenticateUserByJwt, AuthController.logout);

// Password Handling
router.put('/resetPassword', authenticateUserByJwt,ResetPasswordValidationYup,AuthController.resetPassword);//✅
router.post('/forgetPassword', AuthController.resetForgetPassword);


module.exports = router;
