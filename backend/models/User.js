const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  refreshToken: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.statics.initializeDefaultUsers = async function() {
  const existingAdmin = await this.findOne({ email: 'admin@example.com' });
  if (!existingAdmin) {
    const defaultPasswords = {
      admin: await bcrypt.hash('Admin123!', 12),
      moderator: await bcrypt.hash('Moderator123!', 12),
      user: await bcrypt.hash('User123!', 12)
    };

    const defaultUsers = [
      { email: 'admin@example.com', password: defaultPasswords.admin, role: 'admin' },
      { email: 'moderator@example.com', password: defaultPasswords.moderator, role: 'moderator' },
      { email: 'user@example.com', password: defaultPasswords.user, role: 'user' }
    ];

    await this.insertMany(defaultUsers);
    console.log('Default users created successfully');
    console.log('Default login credentials:');
    console.log('Admin: admin@example.com / Admin123!');
    console.log('Moderator: moderator@example.com / Moderator123!');
    console.log('User: user@example.com / User123!');
  }
};

userSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;