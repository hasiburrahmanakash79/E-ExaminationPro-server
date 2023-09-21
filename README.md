# E-ExamPro Backend

Welcome to the backend of E-ExamPro, an online platform for conducting exams and managing educational content. This backend is responsible for handling various features and functionalities of the platform. Below, you'll find information on how to set up and use this backend for your E-ExamPro application.

## Table of Contents

- Technologies Used
- Prerequisites
- Getting Started
- API Endpoints
- Database Collections
- Payment Integration
- Forum Communication
- Contributing
- Conclusion

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT (JSON Web Tokens)
- Stripe (for payment processing)
- SSLCommerz (for payment processing)
- Axios (for making HTTP requests)
- CORS (Cross-Origin Resource Sharing)
- .env (for environment variables)
- Other relevant libraries

## Prerequisites

Before you start using the E-ExamPro backend, make sure you have the following:

- Node.js installed on your system.
- MongoDB Atlas account with a configured database.
- Stripe and SSLCommerz API keys (for payment processing).
- Necessary environment variables set in a `.env` file.

## Getting Started

1. Clone this repository to your local machine.

```bash
git clone https://github.com/your-username/e-exampro-backend.git
```

2. Navigate to the project directory and install dependencies.

```bash
cd e-exampro-backend
npm install
```

3. Create a `.env` file in the project root and configure the necessary environment variables.

```
DB_USER=your-mongodb-username
DB_SECRET=your-mongodb-password
DB_URL=your-mongodb-atlas-url
STORE_ID=your-sslcommerz-store-id
STORE_PASS=your-sslcommerz-store-password
PAYMENT_SECRETE_KEY=your-stripe-secret-key
SECRETE_TOKEN=your-secret-jwt-token
PORT=4000
```

4. Start the server.

```bash
npm start
```

The backend server should now be running on port 4000 or the port specified in your `.env` file.

## API Endpoints

The backend provides various API endpoints for handling different functionalities of the E-ExamPro platform. Here are some of the important endpoints:

- `/comments`: POST and GET comments for blog posts.
- `/blogs`: POST and GET blogs.
- `/jwt`: Generate JWT tokens for authentication.
- `/allSubjects`: GET all available subjects.
- `/questionPaper`: POST and GET exam questions.
- `/result`: GET exam results.
- `/users`: POST, GET, and DELETE user information.
- `/updateProfile`: PATCH user profile information.
- `/notice`: POST and GET notices.
- `/liveQuestionPaper`: POST and GET live exam questions.
- `/create-payment-intent`: Create payment intents for Stripe payments.
- `/payments`: POST payment information.
- `/forumPost`: POST, GET, PATCH, and DELETE forum posts and replies.

For more details on API endpoints and their usage, refer to the API documentation.

## Database Collections

The backend uses MongoDB to store various data related to users, exams, comments, blogs, notices, and more. The database collections include:

- `users`: Stores user information.
- `shortQuestions`, `longQuestions`, `quizQuestions`, `fillInTheBlanks`: Collections for different types of exam questions.
- `subjects`: Stores information about subjects.
- `testimonials`: Contains testimonials from users.
- `faqs`: Stores frequently asked questions.
- `instructors`: Stores instructor information.
- `statistics`: Contains statistical data.
- `Question_Collection`: Stores exam questions.
- `allSubjects`: Contains a list of all subjects.
- `payments`: Stores payment information.
- `paymentHistory`: Records payment history.
- `notices`: Stores notices for users.
- `appliedLiveExam`: Keeps track of applied live exams.
- `liveExamQuestions`: Stores live exam questions.
- `result_Collection`: Stores exam results.
- `blogs`: Stores blog posts.
- `comments`: Contains comments on blog posts.
- `forumCommunity`: Stores forum posts and replies.
- `packagePricing`: Contains pricing information for packages.

## Payment Integration

The backend integrates with Stripe and SSLCommerz for payment processing. Users can make payments for various packages and services. The `/create-payment-intent` endpoint is used to create payment intents for Stripe payments, while the `/sslPayment` endpoint handles payments using SSLCommerz.

Make sure to configure your API keys and payment settings in the `.env` file.

## Forum Communication

The platform provides a forum communication feature where users can post questions, articles, and replies. The `/forumPost` endpoint is used for managing forum posts and replies.

## Conclusion

Thank you for choosing E-ExamPro as your online exam-taking platform backend. We hope this README helps you get started with setting up and using the backend for your educational platform. If you have any questions or need assistance, please feel free to contact our support team.

We're excited to see how you customise and build upon this backend to create a seamless and efficient exam-taking experience for your users. Happy coding!
