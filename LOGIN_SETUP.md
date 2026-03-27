# Login & Authentication Setup

This application now includes OTP-based email authentication. Follow the instructions below to set up and use the login system.

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Email (SMTP)

Edit `backend/app.py` and update the email configuration:

```python
SMTP_HOST = "smtp.gmail.com"        # Your SMTP server
SMTP_PORT = 587                      # SMTP port
SMTP_USER = "your_email@gmail.com"  # Your email
SMTP_PASSWORD = "your_app_password" # Your app-specific password
```

#### For Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password (16 characters):
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the generated password and use it in `SMTP_PASSWORD`

#### For Other Email Providers:
- Gmail: `smtp.gmail.com:587`
- Outlook: `smtp-mail.outlook.com:587`
- Yahoo: `smtp.mail.yahoo.com:587`

### 3. Run Backend Server

```bash
python app.py
# Server will run on http://localhost:5000
```

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Update API Base URL (if needed)

In `src/lib/authApi.ts`, update the API_BASE_URL:

```typescript
const API_BASE_URL = "http://localhost:5000"; // Change if backend is on different host
```

### 3. Run Development Server

```bash
npm run dev
# App will run on http://localhost:8080
```

## How the Login System Works

### Flow:
1. **User enters email** → Clicks "Send OTP"
2. **OTP sent to email** → Valid for 5 minutes
3. **User enters OTP** → Clicks "Verify & Login"
4. **Session created** → Redirects to home page
5. **User profile displayed** → Shows email in header with logout button

### Features:
- ✅ OTP expires after 5 minutes
- ✅ Resend OTP after 30 seconds
- ✅ Email validation
- ✅ Session-based authentication
- ✅ Secure logout
- ✅ Beautiful UI with animations
- ✅ Error handling and user feedback

## Files Created/Modified

### New Files:
- `src/pages/Login.tsx` - Login page component
- `src/lib/authApi.ts` - Authentication API client
- `src/hooks/useAuth.ts` - Authentication hook

### Modified Files:
- `backend/app.py` - Added authentication endpoints
- `src/App.tsx` - Added login route
- `src/components/Header.tsx` - Added user profile & logout button
- `backend/requirements.txt` - Added flask-session dependency

## API Endpoints

### POST `/auth/send-otp`
Send OTP to user email
```json
Request: { "email": "user@example.com" }
Response: { "success": true, "message": "OTP sent to your email!" }
```

### POST `/auth/verify-otp`
Verify OTP and create session
```json
Request: { "email": "user@example.com", "otp": "123456" }
Response: { "success": true, "message": "Login successful!", "user": "user@example.com" }
```

### POST `/auth/logout`
Logout user
```json
Request: {}
Response: { "success": true, "message": "Logged out successfully" }
```

### GET `/auth/status`
Check authentication status
```json
Response: { "logged_in": true, "user": "user@example.com" }
```

## Security Notes

- ⚠️ Change `app.config['SECRET_KEY']` in `backend/app.py` to a secure random string
- ⚠️ Never commit email/password to version control
- ⚠️ Use environment variables for sensitive data in production
- ✅ OTPs are expired after 5 minutes
- ✅ Sessions are server-side validation
- ✅ CORS is enabled for frontend-backend communication

## Troubleshooting

### Email not sending?
- Check SMTP credentials in `backend/app.py`
- Verify firewall allows SMTP port (587)
- For Gmail, ensure App Password is used (not main password)

### CORS errors?
- Ensure backend CORS is configured: `CORS(app, supports_credentials=True)`
- Check API_BASE_URL matches backend URL

### Session not persisting?
- Backend filesystem session storage is in `flask_session/` directory
- In production, use Redis or database for session storage

### Port conflicts?
- Backend: Change port in `app.run(debug=True, port=5000)`
- Frontend: Change port in `vite.config.ts`

## Production Deployment

For production:

1. **Backend**:
   - Use production WSGI server (Gunicorn, uWSGI)
   - Configure environment variables for secrets
   - Use database/Redis for session storage
   - Enable HTTPS only

2. **Frontend**:
   - Build: `npm run build`
   - Update API_BASE_URL to production backend
   - Use environment variables for configuration

3. **Email**:
   - Use a professional email service (SendGrid, AWS SES)
   - Configure SPF, DKIM, DMARC records
   - Monitor deliverability
