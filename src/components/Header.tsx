import { motion } from "framer-motion";
import { Music } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isListenMusic = location.pathname === "/listen-music";

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleListenMusicClick = () => {
    navigate("/listen-music");
  };

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-background/40 backdrop-blur-md border-b border-primary/10">
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
          Free Sounds
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
      </nav>
    </header>
  );
}
