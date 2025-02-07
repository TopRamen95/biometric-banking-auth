# Net Banking Security System

## Overview

This project is a **secure net banking system** with advanced authentication and voice-assisted chatbot features. It aims to provide a safe and user-friendly experience for elderly users by integrating **two-factor authentication (2FA), face and voice recognition, and a chatbot for transaction assistance**.

## Features

- **Voice-Assisted Chatbot**: Users can perform banking actions using voice commands.
- **Two-Factor Authentication (2FA)**:
  - UPI-based authentication.
  - Temporary secret passcode verification.
- **Face and Voice Detection**: Used as primary authentication methods.
- **Secure Transactions**: Ensures secure money transfers and banking operations.
- **Django REST API**: Backend built using Django REST framework.
- **Frontend (Optional)**: Can be integrated with a React/Flutter UI.

---

## Tech Stack

- **Backend**: Django, Django REST Framework
- **Frontend**: (Optional) React.js / Flutter
- **Database**: PostgreSQL / MySQL
- **Authentication**: Face Recognition, Voice Recognition, UPI Authentication
- **Other Tools**: OpenCV, Speech Recognition, PyTorch (for AI models)

---

## Project Setup

### 1. Clone the Repository

```bash
   git clone https://github.com/your-username/net-banking-security.git
   cd net-banking-security
```

### 2. Create a Virtual Environment

```bash
   python3 -m venv venv
   source venv/bin/activate  # For Mac/Linux
   venv\Scripts\activate     # For Windows
```

### 3. Install Dependencies

```bash
   pip install -r requirements.txt
```

### 4. Configure the Database

- Update `backend/django_api/settings.py` with your database credentials.
- Run migrations:

```bash
   python3 manage.py makemigrations auth_app
   python3 manage.py migrate
```

### 5. Create a Superuser (For Admin Access)

```bash
   python3 manage.py createsuperuser
```

### 6. Start the Server

```bash
   python3 manage.py runserver
```

### 7. Running the Chatbot

```bash
   python chatbot.py  # Runs voice assistant for banking
```

---

## How the System Works

1. **User Authentication**:

   - User logs in using **face or voice recognition**.
   - If authentication fails, a **UPI-based 2FA process** is initiated.
   - A **temporary secret passcode** is provided, which the user must spell out to the chatbot.

2. **Voice-Assisted Transactions**:

   - The chatbot guides users in making transfers using simple voice commands.
   - Users confirm transactions via **voice authentication** or **UPI 2FA**.

3. **Security Measures**:

   - Data is encrypted before being stored.
   - Logs track all transactions and authentication attempts.
   - Face and voice recognition models ensure accurate authentication.

---

## API Endpoints (Backend)

| Method | Endpoint                     | Description                             |
| ------ | ---------------------------- | --------------------------------------- |
| POST   | `/api/auth/login/`           | Logs in user via face/voice recognition |
| POST   | `/api/auth/verify-otp/`      | Verifies OTP for 2FA                    |
| POST   | `/api/chatbot/command/`      | Processes voice commands                |
| POST   | `/api/transactions/`         | Initiates money transfer                |
| GET    | `/api/transactions/history/` | Fetches user transaction history        |

---

## Future Enhancements

- **GPS-based OTP generation** for location-based security.
- **Blockchain integration** for transaction security.
- **Multi-language support** for chatbot.
- **AI-powered fraud detection system**.

---

## Contributing

1. Fork the repo.
2. Create a new branch: `git checkout -b feature-branch`
3. Commit changes: `git commit -m 'Added new feature'`
4. Push to the branch: `git push origin feature-branch`
5. Open a Pull Request.

---

## License

This project is licensed under the MIT License.

---

## Contact

For any issues or collaboration, contact: [mahaan321@gmail.com](mailto\:mahaan321@gmail.com).

