
# Express Auth App

A secure Node.js authentication application with role management, email verification, profile image upload, JWT-based access, security layers (rate limiting, helmet), password recovery, and more.

---

## 📦 Features

* ✅ JWT-based authentication
* ✅ Registration for `Admin` and `Client`
* ✅ Email verification via 6-digit code
* ✅ Secure login/logout system
* ✅ Profile image upload via `Multer`
* ✅ Password reset (forgot or current)
* ✅ Account status management (`Pending`, `Active`)
* ✅ Security: `Helmet`, `RateLimiter`, `CORS`
* ✅ Email delivery via `Nodemailer`

---

## 📁 Project Structure

```
.
├── src/
│   ├── controllers/         # Logic controllers
│   ├── middlewares/         # Custom middlewares
│   ├── models/              # Mongoose models
│   ├── routes/              # Route definitions
│   ├── services/            # Email service
│   ├── utils/               # Utility functions
│   ├── validators/          # Yup validations
├── uploads/profile-images/  # Uploaded images folder
├── .env                     # Environment variables
├── App.js                   # Application entry point
```

---

## ⚙️ Requirements

* Node.js v18+
* MongoDB (local or cloud)
* A valid email account (Gmail recommended for testing)

---

## 🚀 Installation

```bash
git clone https://github.com/chahabsarah/express-auth-app.git
cd express-auth-app
npm install
```

Create a `.env` file at the root:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/auth-db
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SESSION_SECRET=some_secret_session
ROLEONE=admin
ROLETWO=client
```

---

## 🧪 Run the Project

```bash
npm run dev
```

Server will be available at: [http://localhost:3000](http://localhost:3000)

---

## 🧾 API Endpoints

### 🔐 Authentication

#### POST `/api/auth/signupadmin`

Register a new admin account.

#### POST `/api/auth/signupuser`

Register a new client with `multipart/form-data` for profile image.

**Form Data Fields**:

| Field          | Type             |
| -------------- | ---------------- |
| fullName       | text             |
| email          | text             |
| password       | text             |
| retypePassword | text             |
| cin            | text             |
| address        | text             |
| phone          | text             |
| role           | text             |
| profileImage   | file (.jpg/.png) |

#### POST `/api/auth/verifyEmail`

Verify the account using the 6-digit code sent to the email.

#### POST `/api/auth/login`

Login with email and password (JWT token returned).

#### POST `/api/auth/logout`

Logout (requires `userId` in body).

#### PUT `/api/auth/resetPassword`

Reset current password (JWT token required).

#### POST `/api/auth/forgetPassword`

Reset password via email (a new password is sent).

---

## 🔒 Security

* JWT for session authentication
* Rate Limiting to prevent brute-force attacks
* Helmet for securing HTTP headers
* Yup-based validation
* Account status changes to `Pending` after 3 failed login attempts

---

## 📂 Image Upload

Profile images are stored in:

```
uploads/profile-images/
```

Accessible via:

```
http://localhost:3000/uploads/profile-images/<filename>
```

---

## 📧 Email Delivery

Emails are sent using `nodemailer`. Configure your email credentials in the `.env` file:

* If using Gmail, enable "Less secure app access" or generate an app password.
* Example: [Generate Gmail App Password](https://myaccount.google.com/apppasswords)

---

## ✍️ Author

**Sarra Chahab**
