const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();

const dbUrl =
  "mongodb+srv://nomindbhutan:ZJEd2PhLifmzvUDQ@fbscraper.taussv1.mongodb.net/?retryWrites=true&w=majority";

// Connect to the database

// Define the Post model only once
const Post = mongoose.model("Post", {
  id: String,
  message: String,
  created_time: String,
});

const fetchAndStoreData = async () => {
  try {
    const accessToken =
      "EAAKDwGItCwYBO1VXTBYxSjbQIoHyEAGZCQpfUQrmXGDfhvX8WV0XflEwsuImfDwmNhZAQTUWtZCrdEYLeoxb9Mhtv9YrWjT4mvrjKEXkoYeZC1IoR65R9KNGoZCUp5n6KrtsPYJbAydAP6PQjXHU8n2LeNBriVtbVbhJ5jQRKafjRCdwzpIhDk5is3J5el6IZD";
    const pageId = 101550476333422;
    const apiUrl = `https://graph.facebook.com/v18.0/${pageId}/?fields=feed{id,message,created_time}&access_token=${accessToken}`;
    var data = [];
    axios
      .get(apiUrl)
      .then((response) => {
        // console.log(response.data.posts.data);
        const posts = response.data.feed.data;
        posts.forEach((post) => {
          data.push(post);
        });
        if (response.data.feed.paging && response.data.feed.paging.next) {
          const nextUrl = response.data.feed.paging.next;
          return axios.get(nextUrl);
        }
        return null;
      })
      .then(async (nextPageResponse) => {
        // console.log(nextPageResponse.data.data);
        const postss = nextPageResponse.data.data;
        postss.forEach((post) => {
          data.push(post);
        });
        // data.push(nextPageResponse.data.data);
        // console.log(data);
        // const d = JSON.parse(JSON.stringify(data));
        const posts = await Post.insertMany(data);
      });
  } catch (error) {
    console.error("Error fetching and storing data:", error);
  }
};

const getAccessToken = async () => {
  const short_user_access_token =
    "EAAKDwGItCwYBO2PdnZBxffGooU1O8GAWGx94IGTZCrMC38ZAf2n6HEil8wCfLCWsxpk0Tw8yCYDDZB16NJhgqq93XE85dpIB6ZBSUSqKNZCwKkNfvoJGFz8YkF1K20f3DwLQEi2QO04Fe3Q0ErQM7d9VWIQptLHQ1IG3MT1VjhvggEJ4seZCPClJwnQWjWxvL2lJxT1S3eBXrjohQx93cqeVDUZD";
  const res = await axios.get(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=707812257499910&client_secret=19609ffb995de1e6b445dd9ab286e096&fb_exchange_token=${short_user_access_token}`
  );
  console.log(res);
  const long_user_access_token = res.data.access_token;
  const res2 = await axios.get(
    `https://graph.facebook.com/v18.0/me?access_token=${long_user_access_token}`
  );
  console.log(res2);
  const user_id = res2.data.id;
  const res3 = await axios.get(
    `https://graph.facebook.com/v18.0/${user_id}/accounts?access_token=${long_user_access_token}`
  );
  console.log(res3.data.data);
  const user_access_token = res3.data.data[0].access_token;
  console.log(user_access_token);
  const pageAccessToken = await axios.get(
    `https://graph.facebook.com/${user_id}/accounts?access_token=${user_access_token}`
  );
  console.log(pageAccessToken.data.data[0].access_token);
};

const lookForUpdates = async (req, res) => {
  try {
    const pageId = 101550476333422;
    const accessToken =
      "EAAKDwGItCwYBOwwwUNS9h0naNsI7CcmLvNj8rI2JYAOyADPPIIEnWri3ka2B0LKI1xuigWyjqauevxHXfDmDrerTuvCwM8IP0G6giNBLFOj3RiHlhpHVBWVgOhXC7HAlgimzrGIOU5UOYqwuzFAP4klnli7YPxYiA5B5uSPy3nWmH7G0mtubrw4OBb4ZD";
    var data = [];
    const apiUrl = `https://graph.facebook.com/v18.0/${pageId}/?fields=feed{id,message,created_time}&access_token=${accessToken}`;
    axios
      .get(apiUrl)
      .then((response) => {
        // console.log(response.data.posts.data);
        // console.log(response.data);
        const posts = response.data.feed.data;
        posts.forEach((post) => {
          data.push(post);
        });
        if (response.data.feed.paging && response.data.feed.paging.next) {
          const nextUrl = response.data.feed.paging.next;
          return axios.get(nextUrl);
        }
        return null;
      })
      .then(async (nextPageResponse) => {
        // console.log(nextPageResponse.data.data);
        const postss = nextPageResponse.data.data;
        postss.forEach((post) => {
          data.push(post);
        });
        // data.push(nextPageResponse.data.data);
        // console.log(data);
        // const d = JSON.parse(JSON.stringify(data));
        // const posts = await Post.insertMany(data);
        data.forEach(async (feed) => {
          const feedd = await Post.findOne({ id: feed.id });
          if (!feedd) {
            await Post.create(feed);
          }
        });
      });
  } catch (error) {
    console.log("errror", error);
    // res.status(500).json({ error: err });
  }
};

// Fetch and store data initially when the server starts

// setInterval(fetchAndStoreData, 50000);

app.get("/posts", async (req, res) => {
  try {
    // Fetch data from the database
    const posts = await Post.find({}).exec();
    res.json(posts); // Send the fetched data as a JSON response
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Example listening port, replace 3030 with your desired port number
mongoose
  .connect(dbUrl, {
    // Add necessary options if required
  })
  .then(() => {
    console.log("Connected to database");
    app.listen(3030, () => {
      console.log("Server is running on port 3030");
      // fetchAndStoreData();
      setInterval(lookForUpdates(), 30 * 60 * 1000);
      // getAccessToken();
    });
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });
