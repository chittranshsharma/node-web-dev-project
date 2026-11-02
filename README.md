# Web Development Backend Project

This project is a simple backend API built with Node.js, Express, and MongoDB. It helped me practise how a server receives requests, checks data, and saves it in a database. There is no frontend, so I use Postman to send requests and see the responses.

## What it does

- A user can register with a username, email, and password.
- Login checks whether the email and password are correct.
- The API can create, show, update, and delete posts.
- It gives clear responses when a request has missing or invalid data.

Passwords are hashed before they are stored in MongoDB, and they are not shown in API responses. The project uses separate routes, controllers, and models so I can follow what happens to a request: the route receives it, the controller handles it, and the model works with the database.

## Testing

I tested the API in Postman by registering a user, checking login, and creating, updating, reading, and deleting a post. I also tried invalid requests to see the error responses. The post was still there after restarting the server, which showed me that MongoDB was storing the data.

One thing to know: login checks the password, but it does not create a session. Logout sends a response, but there is no session to end. The post routes can still be used without logging in.

