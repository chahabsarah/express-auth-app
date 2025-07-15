const mongoose = require('mongoose');
const validator = require('validator');
const { isPasswordValid, resetPassword } = require('../utils/VerifyPassword');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: true
  },
  passwordHistory: [String],
    cin: { 
    type: String,
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String, 
    enum: ['admin', 'client'], 
    required: true,
    default: 'client'
  },
  AccountStatus:{
    type: String,
    enum: ['Pending', 'Active','Archived','Inactive'],
    default:'Pending'
  },
  profileImage: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
  },
  refreshToken: {
    type: String
  },
  refreshTokenExpiration: {
     type: Date 
  },
  failedAttempts :{
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  trustDeviceCode :{
    type : String,
  },
  trustDeviceCodeExpriation :{
    type: Date,
  },
},
);

userSchema.methods.isPasswordValid = isPasswordValid;
userSchema.methods.resetPassword = resetPassword;

module.exports = mongoose.model('User', userSchema);
