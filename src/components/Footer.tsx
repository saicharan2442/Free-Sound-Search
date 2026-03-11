import { motion } from "framer-motion";
import DecryptedText from "./DecryptedText";
import { AudioPlayer } from "./AudioPlayer";

interface FooterProps {
  audioUrl?: string;
  title?: string;
  artist?: string;
  onClose?: () => void;
}

export function Footer({ audioUrl, title, artist, onClose }: FooterProps = {}) {
  return (
    <>
      {/* Audio Player at bottom */}
      <AudioPlayer
        audioUrl={audioUrl}
        title={title}
        artist={artist}
        onClose={onClose}
      />

      {/* Footer Content - only show when no music playing */}
      {!audioUrl && (
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md"
        >
          <div className="px-4 py-6 text-center">
            <p className="text-muted-foreground text-sm">
              {" "}
              <a
                href="http://saicharansada.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                --*--
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
          </div>
        </motion.footer>
      )}
    </>
  );
}

