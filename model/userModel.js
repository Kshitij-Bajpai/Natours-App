const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name must be required'],
  },
  email: {
    type: String,
    required: [true, 'Email must be provided'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email must be valid'],
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'lead-guide', 'admin', 'guide'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password must be provided'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirm Password must be provided'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password do not match !!',
    },
  },
  passwordChangedAt: Date,
  passwordToken: String,
  passwordTokenExpiry: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  //subtract 1 s to avoid error originating due to slow database call
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

//Instance method
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isPasswordModified = function (tokenTime) {
  if (this.passwordChangedAt) {
    const changeTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    //tokenTime smaller : token is generated with password A and then the password is updated to password B
    //and now trying to login with token generated with password A
    //changeTime smaller: token is generated with password A and login is done with same token
    return changeTime > tokenTime;
  }
  return false;
};

userSchema.methods.forgotPassTokenGenerator = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordToken = crypto.createHash('sha256').update(token).digest('hex');

  this.passwordTokenExpiry = Date.now() + 10 * 60 * 1000;

  return token;
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
