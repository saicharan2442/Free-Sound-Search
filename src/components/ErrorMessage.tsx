import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto glass rounded-2xl p-6 text-center"
    >
      <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
      <p className="text-foreground font-medium mb-1">Something went wrong</p>
      <p className="text-muted-foreground text-sm">{message}</p>
    </motion.div>
  );
}
