import { motion, AnimatePresence } from "framer-motion";
import { Music, LogOut, User, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === "/";
  const isListenMusic = location.pathname === "/listen-music";
  const isLogin = location.pathname === "/login";

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileOpen]);

  const handleLogoClick = () => {
    if (isLoggedIn) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  const handleListenMusicClick = () => {
    navigate("/listen-music");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className="relative z-30 flex items-center justify-between px-6 py-4 bg-background/40 backdrop-blur-md border-b border-primary/10">
      {/* Logo */}
      <motion.button
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        onClick={handleLogoClick}
        className="cursor-target flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <img
          src="/fss-logo.png"
          alt="FSS Logo"
          className="h-10 w-auto object-contain"
        />
        <span className="hidden sm:inline text-sm font-semibold text-foreground">Free Sound</span>
      </motion.button>

      {/* Navigation Buttons */}
      <nav className="flex items-center gap-3">
        {isLoggedIn && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogoClick}
              className={`cursor-target px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isHome
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Explore
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleListenMusicClick}
              className={`cursor-target flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isListenMusic
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Listen Music</span>
            </motion.button>
          </>
        )}

        {/* Auth Section */}
        {isLoggedIn ? (
          <motion.div
            ref={profileRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex items-center gap-3 ml-2 pl-3 border-l border-primary/20"
          >
            {/* Profile Button with Dropdown */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="cursor-target flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">
                  {user?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:inline text-sm font-medium text-foreground">
                {user?.split("@")[0]}
              </span>
            </motion.button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-background/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  {/* Profile Header */}
                  <div className="px-4 py-4 border-b border-white/10 bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
                          {user?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user?.split("@")[0]}</p>
                        <p className="text-xs text-muted-foreground">{user}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => setProfileOpen(false)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-foreground hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => setProfileOpen(false)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-foreground hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10" />

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          !isLogin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoginClick}
              className="cursor-target px-4 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-all"
            >
              Login
            </motion.button>
          )
        )}
      </nav>
    </header>
  );
}
