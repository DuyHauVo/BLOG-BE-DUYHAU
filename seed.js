const mongoose = require('mongoose');

const uri = "mongodb+srv://Simple_Blog:iyV3Rg7d.eY8Jjd@cluster0.b8eaknd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String
}, { collection: 'users' });

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  author: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'posts' });

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");

    const emails = ["voduyhau272@gmail.com", "lehuynhytruclinh176@gmail.com"];
    
    for (const email of emails) {
      let user = await User.findOne({ email });
      if (!user) {
        console.log(`User ${email} not found. Creating...`);
        // We'll just create a dummy user with a fake password for now if it doesn't exist.
        // It's better if they already exist.
        user = await User.create({
          email,
          name: email.split('@')[0],
          password: "dummy_hashed_password",
          role: "USERS"
        });
      }

      console.log(`Found user ${email} with ID: ${user._id}`);
      
      // Create 5 posts
      for (let i = 1; i <= 5; i++) {
        await Post.create({
          title: `Post ${i} by ${user.name}`,
          content: `This is the content for post ${i} written by ${user.name}. It is a generated post to test the My Blog feature and the Blog display. It has enough content to be truncated by the line clamp.`,
          image: `https://picsum.photos/seed/${user._id}${i}/800/600`,
          author: user._id
        });
      }
      console.log(`Created 5 posts for ${email}`);
    }

    console.log("Done seeding.");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
