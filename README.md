# React + NestJS Authentication 🔒 🔑

Welcome to the React + NestJS Authentication project! This is a comprehensive example of email/password authentication using React and NestJS. This application incorporates a wide range of features to ensure secure and efficient authentication:

## ✅ Features

- **Sign Up, Sign In, and Sign Out**: Easily manage user registration and authentication.

- **Email/Password Validation**: Utilizes `class-validator` to ensure the integrity of email and password inputs.

- **Token-Based Authentication**: Implements JSON Web Tokens (JWT) for secure authentication.

- **Hashing with Bcrypt**: Safely stores user data with password hashing and secure secret management for JWT tokens.

- **Refresh Token**: Enables silent authentication for added security and enhanced user experience.

- **Stateless Access Tokens and Stateful Refresh Tokens**: Balances security and performance.

- **HTTP-Only Cookies**: Enhances security by sending tokens via cookies.

- **Authorization with NestJS Guards**: Efficiently control access to resources.

- **Logging with Pino and NestJS Logger**: Comprehensive and informative logging.

- **Global Error Handling**: Ensures consistent and user-friendly exception responses from the server.

- **Data Serialization**: Conceals sensitive information like passwords and secrets in responses using the `SanitizeMongooseModelInterceptor`.

- **Client-Side Private Routing**: Navigating private routes is seamlessly integrated into the application.

- **Axios Interceptors**: Smoothly manages token refresh scenarios for a seamless user experience.

- **Beautiful UI**: An aesthetically pleasing user interface to enhance the user experience including dark mode support.

## Strategy

```
+---------------------+   +-------------------------+   +-----------------------+
|     User            |   |  Authentication Server  |   |    Resource Server    |
|                     |   |                         |   |                       |
+---------------------+   +-------------------------+   +-----------------------+
|                         |                            |                   		 |
|                         |                            |                   		 |
|---(1) Sign In---------> |                            |                   		 |
|                         |                            |                    	 |
|                         |                            |                    	 |
|                         |<--(2) Access Token         |                    	 |
|                         |<--(3) Refresh Token        |                    	 |
|<--(4) Access Token      |                            |                    	 |
|                         |                            |                     	 |
|                         |                            |                    	 |
|                         |                            |<--(5) Access Resource   |
|                         |                            |                    	 |
|                         |                            |                    	 |
|                         |<--(6) Access Denied        |                   	 	 |
|                         |                            |                     	 |
|                         |                            |                      	 |
|                         |                            |                    	 |
|                         |<--(7) Refresh Token        |                    	 |
|                         |                            |                     	 |
|                         |                            |                    	 |
|<--(8) New Access Token  |                            |                    	 |
|                         |                            |                    	 |
|                         |                            |                    	 |
|                         |                            |<--(9) Access Resource   |

```

## 🏢 Server Setup

**Set up a MongoDB database for the project. You can follow these steps to set up MongoDB:**

- [Download and Install MongoDB](https://docs.mongodb.com/manual/installation/)
- [Getting Started with MongoDB](https://docs.mongodb.com/manual/tutorial/getting-started/)

---

- Clone the repository from: https://github.com/rehan-sattar/react-nest-auth.git
- Get into the folder via `cd react-nest-auth` and then into server folder by: `cd server`.
- `npm install`
- Create two environment variable files inside the `server` directory, one for development and second one for testing named as `.env.dev` & `.env.test` respectively.

```bash
## Sample environment variable file
MONGODB_URI=mongodb://localhost:27017/ez-auth
JWT_SECRET=YOUR_SECRET_HERE
JWT_TOKEN_AUDIENCE=http://localhost:3000
JWT_TOKEN_ISSUER=http://localhost:3000
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400
```

### Running Test Cases

This project contains end-to-end test cases for maximum scenarios which can be run by using:

```bash
npm run test
OR
npm run test:watch // watch mode
```

### Starting Dev Server

```bash
npm run start:dev
```

## 🌐 Client Setup

Once the server is up and running, Follow these steps to run the client app locally:

- `cd client`
- `npm install`
- `npm start`

## 💻 Technologies Used

- React + ChakraUI
- NestJS
- class-validator
- JSON Web Tokens (JWT)
- Bcrypt
- Axios
- Pino
- and more...

## 🙋🏻‍♂️ Contributing

Contributions to this project are welcome! Feel free to open issues or pull requests to improve the code or add new features.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

We hope you enjoy working with this React + NestJS Authentication project! If you have any questions or need assistance, please don't hesitate to reach out. Happy coding! 🎉
