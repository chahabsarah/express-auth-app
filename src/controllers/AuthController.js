const {sendVerificationCode,updatePasswordAlert,forgotPasswordReset,} =
require('../services/EmailService')
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const generateRandomPassword = require('../utils/RandomPassword');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

/* **************************Configuration Multer ***************************/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder ='uploads/profile-images';
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = {
      'cv': ['.pdf', '.doc', '.docx'],
      'profileImage': ['.jpg', '.jpeg', '.png']
    };
    const ext = path.extname(file.originalname).toLowerCase();
    const field = file.fieldname;
    if (!allowedExtensions[field] || !allowedExtensions[field].includes(ext)) {
      return cb(new Error(`Fichier non autorisé pour ${field}.`));
    }
    cb(null, true);
  }
});
/* **************************start of sign up clients**********************************/
const registerClients = async (req, res) => {
  const uploadSingle = upload.single('profileImage');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { fullName, email, password, retypePassword, cin, address, role, phone } = req.body;

      // Vérification des champs obligatoires
      if (!fullName || !email || !password || !cin || !address || !role || !phone) {
        return res.status(400).json({ message: 'All fields are required!' });
      }

      // Vérification de l'unicité CIN et Email
      if (await User.findOne({ cin })) {
        return res.status(400).json({ message: 'CIN already used!' });
      }

      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'Email already used!' });
      }

      if (password !== retypePassword) {
        return res.status(400).json({ message: 'Passwords do not match!' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
        cin,
        address,
        role,
        phone,
        profileImage: req.file ? req.file.path : null, // ✅ Corrigé ici
        verificationCode,
      });

      await newUser.save({ validateModifiedOnly: true });
      await sendVerificationCode(email, verificationCode);

      return res.status(201).json({
        success: true,
        message: 'User created successfully! Please check your email to verify your account.',
        user: newUser,
      });

    } catch (error) {
      console.error("Error when creating user:", error);
      return res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
  });
};

/* **************************end of sign up clients**********************************/

/* **************************start of sign up Admin********************************* */
const signUpAdmin = async (req, res) => {
    try {
        const { fullName, email, phone, password, retypePassword, address,cin} = req.body;
        if (!fullName || !email || !phone || !password || !retypePassword || !address ||!cin) {
          return res.status(400).json({ message: 'all fields must be filled' });
        }
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) return res.status(400).json({ message: 'phone already exist!' });
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'email already exist!' });
        if (password !== retypePassword) {
          return res.status(400).json({ message: 'passwords are not the same!' });
        }
      const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          fullName,
          email,
          phone,
          password:hashedPassword,
          address,
          role:process.env.ROLEONE,
          cin,
        });
      newUser.isVerified = true;
      newUser.verificationCode = null;
      newUser.AccountStatus='Active';
      await newUser.save();
        res.status(201).json({
          success: true,
          message: 'Admin account created! check ur email to verify your account',
          user: newUser
        });
    } catch (error) {
      res.status(500).json({ message: 'error when creating user', error: error.message });
    }
  };
/* **************************end of sign up admin********************************* */

/* **************************start of verify email********************************* */
const verifyEmail = async (req, res) => {
    try {
      const { email, code } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'invalid email' });
      if (user.verificationCode !== code) {
        return res.status(400).json({ message: 'wrong code' });
      }
      if (user.isVerified) {
        return res.status(400).json({ message: 'email already verified!' });
      }
      user.isVerified = true;
      user.verificationCode = null;
      user.AccountStatus='Active';
      await user.save();
      res.status(200).json({ message: 'email verified!' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
/* **************************end of verify email********************************* */

/* **************************start of sign in ********************************* */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Wrong credentials" });
    }

    if (isNaN(user.failedAttempts)) {
      user.failedAttempts = 0;
    }

    if (user.AccountStatus !== 'Active' && user.isPasswordValid(password)) {
      user.AccountStatus = 'Active';
      user.failedAttempts = 0;
      await user.save();
    }

    if (user.AccountStatus !== 'Active') {
      return res.status(401).json({ msg: `Your account is '${user.AccountStatus}'!` });
    }

    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      user.failedAttempts += 1;
      await user.save();

    if (user.failedAttempts > 2) {
      user.AccountStatus = 'Pending';
      await user.save();
      return res.status(401).json({ msg: `Your account is '${user.AccountStatus}'!` });
      }

      return res.status(400).json({ msg: "Wrong credentials" });
    }

    
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '48h' }
    );
    const refreshToken = crypto.randomBytes(40).toString('hex');
    console.log('ref', refreshToken);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    console.log('hashed', hashedRefreshToken);

    const refreshTokenExpiration = new Date();
    refreshTokenExpiration.setDate(refreshTokenExpiration.getDate() + 2);

    user.refreshToken = hashedRefreshToken;
    user.refreshTokenExpiration = refreshTokenExpiration;

    const now = new Date();
    user.lastActivity = now;
    await user.save();

    const userId = user._id;
    const role = user.role;
    return res.status(200).json({
      msg: "logged in!",
      accessToken,
      refreshToken,
      userId,
      role,
    });
  } catch (err) {
    console.error("connexion error :", err);
    return res.status(500).json({ msg: "server error." });
  }
};
/* **************************end of sign in ********************************* */

/* **************************log out start********************************* */
const logout = async (req, res) => { 
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    user.refreshToken = null;
    user.refreshTokenExpiration = null;
    await user.save();
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
/* **************************log out end********************************* */

/* **************************reset password start********************************* */
const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('user not found');
    }
    const email = user.email
    await user.resetPassword(req.body.currentPassword, req.body.newPassword);
    await updatePasswordAlert(email)
    res.status(200).send('password updated');
  } catch (error) {
    res.status(400).send(error.message);
  }
};
/* **************************reset password end********************************* */

/* **************************reset forget password start********************************* */
const resetForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('user not found');
    }
    const recoverPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(recoverPassword, 10);
    user.password=hashedPassword;
    await user.save();
    await forgotPasswordReset(email,recoverPassword);
    res.status(200).send('new password sent');
  } catch (error) {
    res.status(400).send(error.message);
  }
};
/* **************************reset forget password end********************************* */



module.exports = { signUpAdmin,verifyEmail,login,logout,resetPassword,resetForgetPassword, registerClients}