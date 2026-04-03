require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const File = require('./models/File');
const Group = require('./models/Group');
const Log = require('./models/Log');

async function resetAllData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    // Clear all collections
    console.log("🗑️  Clearing database collections...");
    await User.deleteMany({});
    console.log("✅ Users cleared");
    
    await File.deleteMany({});
    console.log("✅ Files cleared");
    
    await Group.deleteMany({});
    console.log("✅ Groups cleared");
    
    await Log.deleteMany({});
    console.log("✅ Logs cleared");

    // Delete all uploaded files
    console.log("🗑️  Clearing uploaded files...");
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      fs.readdirSync(uploadsDir).forEach(file => {
        const filePath = path.join(uploadsDir, file);
        fs.unlinkSync(filePath);
      });
      console.log("✅ All uploaded files deleted");
    }

    console.log("✅ All data cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during reset:", error);
    process.exit(1);
  }
}

resetAllData();
