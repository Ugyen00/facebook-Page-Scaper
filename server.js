const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();

const dbUrl = "mongodb+srv://nomindbhutan:ZJEd2PhLifmzvUDQ@fbscraper.taussv1.mongodb.net/?retryWrites=true&w=majority"

// Connect to the database
mongoose.connect(dbUrl, {
    // Add necessary options if required
})
    .then(() => {
        console.log('Connected to database');
    })
    .catch((err) => {
        console.error(`Error connecting to the database. \n${err}`);
    });

// Define the Post model only once
const Post = mongoose.model('Post', {
    message: String,
    created_time: Date
});

const fetchAndStoreData = async () => {
    try {
        const accessToken = "EAAKDwGItCwYBO43Kb7Hfrct13NBgQwhzUrXYnlMN6hFqxmhcT38k32xZBvNtbwCQCODYyddAHaOaUJP4aEh8KiQ2NzqyzWdG0H04LaSmOlzV9NDr2BSKxm0Vf6ZAFIqx81MZAjWPtfGi2HH3OrKdRomPyDYDuxLZBEZA9wZCPIs0RNrSIZAowVUuZCxm1sZBiSerT2qLduSpXDWWUgJecMJ1X8AwZD";
        const pageId = 101550476333422;
        const apiUrl = `https://graph.facebook.com/v18.0/${pageId}/?fields=posts{message,created_time}&access_token=${accessToken}`;

        const response = await axios.get(apiUrl);

        if (response.data && response.data.posts && response.data.posts.data) {
            const fetchedPosts = response.data.posts.data;

            for (const fetchedPost of fetchedPosts) {
                // Check if the post already exists in the database by its unique identifier (e.g., message or created_time)
                const existingPost = await Post.findOne({
                    message: fetchedPost.message,
                    created_time: fetchedPost.created_time
                });

                // If the post doesn't exist, insert it into the database
                if (!existingPost) {
                    await Post.create({
                        message: fetchedPost.message,
                        created_time: fetchedPost.created_time
                    });
                    console.log('New post added:', fetchedPost);
                }
            }

            console.log('Data fetched and stored successfully');
        } else {
            console.error('API response format incorrect or missing data');
        }
    } catch (error) {
        console.error('Error fetching and storing data:', error);
    }
};

// Fetch and store data initially when the server starts
fetchAndStoreData();

// Set up an interval to fetch and store data every 10 minutes (600,000 milliseconds)
setInterval(fetchAndStoreData, 50000);

app.get('/posts', async (req, res) => {
    try {
        // Fetch data from the database
        const posts = await Post.find({}).exec();
        res.json(posts); // Send the fetched data as a JSON response
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Example listening port, replace 3030 with your desired port number
app.listen(3030, () => {
    console.log('Server is running on port 3030');
});
