import { motion } from "framer-motion";
import DecryptedText from "./DecryptedText";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="relative z-10 text-center py-10 pb-24"
    >
      <p className="text-muted-foreground text-sm">
        Powered by{" "}
        <a
          href="https://freesound.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Freesound API
        </a>
      </p>
      <p className="text-sm">
        Made by{" "}
        <DecryptedText
          text="saicharan_sada"
          speed={50}
          maxIterations={10}
          className="text-foreground"
          encryptedClassName="text-muted-foreground"
        />{" "}
        with❤️
      </p>
    </motion.footer>
  );
}

