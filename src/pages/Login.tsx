import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, Check, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { sendOtp, verifyOtp } from "@/lib/authApi";
import { useAuth } from "@/hooks/useAuth";
import { ParticleBackground } from "@/components/ParticleBackground";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLoginState } = useAuth();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Check if we came from a redirect (already logged in), redirect to home
  useEffect(() => {
    // Only redirect if we're on login page and came from a protected route redirect
    if (location.state?.from?.pathname && location.state.from.pathname !== "/login") {
      navigate(location.state.from.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await sendOtp(email);
      if (result.success) {
        setSuccess(result.message);
        setStep("otp");
        setResendCountdown(30);
        setOtp("");
      } else {
        setError(result.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(email, otp);
      if (result.success) {
        setSuccess("Login successful! Redirecting to Explore...");
        // Immediately update auth state and redirect to explore page
        setLoginState(email);
        navigate("/", { replace: true });
      } else {
        setError(result.message || "Failed to verify OTP");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden flex items-center justify-center px-4">
      <ParticleBackground />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-secondary/15 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-strong rounded-3xl p-8 backdrop-blur-xl border border-white/10 glow-primary">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">
              {step === "email"
                ? "Enter your email to receive an OTP"
                : "Enter the 6-digit code sent to your email"}
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={step === "email" ? handleSendOtp : handleVerifyOtp} className="space-y-5">
            {step === "email" ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  disabled={loading}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-foreground mb-2">Enter OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-2xl tracking-widest font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Check your email for the code. It expires in 5 minutes.
                </p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3"
              >
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm text-green-200">{success}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="cursor-target w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{step === "email" ? "Sending OTP..." : "Verifying..."}</span>
                </>
              ) : (
                <span>{step === "email" ? "Send OTP" : "Verify & Login"}</span>
              )}
            </motion.button>

            {/* Back Button (for OTP step) */}
            {step === "otp" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border border-white/10 text-foreground font-semibold hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back to Email
              </motion.button>
            )}

            {/* Resend OTP Link */}
            {step === "otp" && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendCountdown > 0 || loading}
                  className="text-sm text-primary hover:text-primary/80 transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {resendCountdown > 0
                    ? `Resend OTP in ${resendCountdown}s`
                    : "Resend OTP"}
                </button>
              </div>
            )}
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-muted-foreground"
          >
            <p>
              By logging in, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>
            </p>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full border border-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full border border-secondary/10 blur-3xl" />
      </motion.div>
    </div>
  );
}
