const API_BASE_URL = "http://localhost:5000";

interface SendOtpResponse {
  success: boolean;
  message: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user?: string;
}

interface AuthStatusResponse {
  logged_in: boolean;
  user?: string;
}

export async function sendOtp(email: string): Promise<SendOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send OTP");
  }

  return response.json();
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<VerifyOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to verify OTP");
  }

  return response.json();
}

export async function logout(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to logout");
  }

  return response.json();
}

export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/status`, {
      method: "GET",
      credentials: "include", // IMPORTANT: Include credentials (cookies)
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Auth status check failed:", response.status);
      return { logged_in: false };
    }

    const data = await response.json();
    console.log("Auth status response:", data);
    return data;
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { logged_in: false };
  }
}
