const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect('mongodb+srv://Simple_Blog:iyV3Rg7d.eY8Jjd@cluster0.b8eaknd.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
  
  const User = mongoose.connection.collection('users');
  const Post = mongoose.connection.collection('posts');
  
  const hau = await User.findOne({ email: 'voduyhau272@gmail.com' });
  const linh = await User.findOne({ email: 'lehuynhytruclinh176@gmail.com' });
  
  if (!hau || !linh) {
    console.log("Cannot find users");
    process.exit(1);
  }

  const sampleImages = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090",
    "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
  ];

  const createPosts = async (userId, userName) => {
    for (let i = 1; i <= 3; i++) {
      // Pick 4 random images
      const shuffled = [...sampleImages].sort(() => 0.5 - Math.random());
      const selectedImages = shuffled.slice(0, 4);

      await Post.insertOne({
        title: `Gallery Post ${i} by ${userName}`,
        content: `This is a sample post by ${userName} featuring multiple stunning photographs. The new gallery layout allows readers to scroll through all these images vertically on the left, while reading this text on the right.`,
        images: selectedImages,
        author: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  };

  await createPosts(hau._id, "Vo Duy Hau");
  await createPosts(linh._id, "Le Huynh Y Truc Linh");

  console.log("Successfully seeded gallery posts!");
  process.exit(0);
}

seed().catch(console.error);
