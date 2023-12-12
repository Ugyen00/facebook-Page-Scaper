const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();

const dbUrl =
  "mongodb+srv://nomindbhutan:ZJEd2PhLifmzvUDQ@fbscraper.taussv1.mongodb.net/?retryWrites=true&w=majority";

// Connect to the database

// Define the Post model only once
const Post = mongoose.model("Post", {
  message: String,
  created_time: String,
});

const fetchAndStoreData = async () => {
  try {
    const accessToken =
      "EAAKDwGItCwYBO1VXTBYxSjbQIoHyEAGZCQpfUQrmXGDfhvX8WV0XflEwsuImfDwmNhZAQTUWtZCrdEYLeoxb9Mhtv9YrWjT4mvrjKEXkoYeZC1IoR65R9KNGoZCUp5n6KrtsPYJbAydAP6PQjXHU8n2LeNBriVtbVbhJ5jQRKafjRCdwzpIhDk5is3J5el6IZD";
    const pageId = 101550476333422;
    const apiUrl = `https://graph.facebook.com/v18.0/${pageId}/?fields=posts{message,created_time}&access_token=${accessToken}`;
    var data = [];
    axios
      .get(apiUrl)
      .then((response) => {
        // console.log(response.data.posts.data);
        const posts = response.data.posts.data;
        posts.forEach((post) => {
          data.push(post);
        });
        if (response.data.posts.paging && response.data.posts.paging.next) {
          console.log("inside");
          const nextUrl = response.data.posts.paging.next;
          return axios.get(nextUrl);
        }
        return null;
      })
      .then(async (nextPageResponse) => {
        console.log("jhhhhh");
        // console.log(nextPageResponse.data.data);
        const postss = nextPageResponse.data.data;
        postss.forEach((post) => {
          data.push(post);
        });
        // data.push(nextPageResponse.data.data);
        console.log(data);
        // const d = JSON.parse(JSON.stringify(data));
        const posts = await Post.insertMany(data);
      });
    console.log(data);
    // const response = await axios.get(apiUrl);

    // if (response.data && response.data.posts && response.data.posts.data) {
    //     const fetchedPosts = response.data.posts.data;

    //     // Store new posts
    //     for (const fetchedPost of fetchedPosts) {
    //         const existingPost = await Post.findOne({
    //             message: fetchedPost.message,
    //             created_time: fetchedPost.created_time
    //         });

    //         if (!existingPost) {
    //             await Post.create({
    //                 message: fetchedPost.message,
    //                 created_time: fetchedPost.created_time
    //             });
    //             console.log('New post added:', fetchedPost);
    //         }
    //     }

    //     console.log('Data fetched and stored successfully');

    // } else {
    //     console.error('API response format incorrect or missing data');
    // }
  } catch (error) {
    console.error("Error fetching and storing data:", error);
    console.log("errorrrrrrrr");
  }
};

// Fetch and store data initially when the server starts

setInterval(fetchAndStoreData, 50000);

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
      fetchAndStoreData();
    });
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });
