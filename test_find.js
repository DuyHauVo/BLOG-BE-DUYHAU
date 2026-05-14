const mongoose = require('mongoose');
const aqp = require('api-query-params');

const uri = "mongodb+srv://Simple_Blog:iyV3Rg7d.eY8Jjd@cluster0.b8eaknd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  author: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'posts' });

async function test() {
  try {
    await mongoose.connect(uri);
    const PostModel = mongoose.model('Post', PostSchema);
    
    const query = { currenPage: "100", Page: "1" };
    const { filter, sort } = aqp(query);
    console.log("Initial filter:", filter);
    
    if (filter.Page) delete filter.Page;
    if (filter.currenPage) delete filter.currenPage;
    
    const user_id = "6a0024669ddcbcc76ce6cc48";
    filter.author = new mongoose.Types.ObjectId(user_id);
    
    console.log("Final filter:", filter);
    
    const TotalItems = (await PostModel.find(filter)).length;
    console.log("TotalItems:", TotalItems);
    
    // limit and skip using string
    const limitVal = query.currenPage || 10;
    const skipVal = ((query.Page || 1) - 1) * limitVal;
    
    console.log("skipVal:", skipVal, "limitVal:", limitVal);
    
    const results = await PostModel.find(filter)
      .skip(skipVal)
      .limit(limitVal)
      .sort(sort);
      
    console.log("Results count:", results.length);
    if(results.length > 0) console.log("First post ID:", results[0]._id);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}

test();
