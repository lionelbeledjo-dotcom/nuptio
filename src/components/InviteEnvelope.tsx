import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EnvelopeProps {
  children: React.ReactNode;
  onOpened?: () => void;
}

function Particle({ index }: { index: number }) {
  const angle = (index / 40) * Math.PI * 2 + Math.random() * 0.5;
  const distance = 80 + Math.random() * 180;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance - 40;
  const size = 4 + Math.random() * 8;
  const rotation = Math.random() * 720 - 360;
  const colors = ["#D4A574", "#F5E6E0", "#FFD700", "#FFFFFF", "#E8C9A0", "#FFF0DB"];
  const color = colors[index % colors.length];
  const delay = Math.random() * 0.3;
  const isCircle = Math.random() > 0.5;

  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
      animate={{
        x,
        y,
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.8],
        rotate: rotation,
      }}
      transition={{
        duration: 1.6 + Math.random() * 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{
        position: "absolute",
        width: size,
        height: isCircle ? size : size * 0.6,
        backgroundColor: color,
        borderRadius: isCircle ? "50%" : "2px",
        top: "50%",
        left: "50%",
        pointerEvents: "none",
      }}
    />
  );
}

function WaxSeal({ isBreaking }: { isBreaking: boolean }) {
  return (
    <motion.div
      className="wax-seal"
      animate={
        isBreaking
          ? {
              scale: [1, 1.1, 0.9, 0],
              opacity: [1, 1, 0.8, 0],
              rotate: [0, -5, 5, -10],
            }
          : { scale: 1, opacity: 1 }
      }
      transition={{
        duration: 0.8,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        bottom: "-18px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 35% 35%, #F0D080, #D4A574 40%, #B8864C 70%, #9A6E3A)",
        boxShadow:
          "0 3px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 3px rgba(255,220,150,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 15,
      }}
    >
      {/* Seal emboss pattern */}
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontFamily: "serif",
            color: "rgba(255,255,255,0.5)",
            fontWeight: "bold",
            textShadow: "0 1px 1px rgba(0,0,0,0.3)",
          }}
        >
          N
        </span>
      </div>
      {/* Seal cracks when breaking */}
      <AnimatePresence>
        {isBreaking && (
          <>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              style={{
                position: "absolute",
                top: "45%",
                left: "10%",
                width: "80%",
                height: "2px",
                background: "rgba(0,0,0,0.4)",
                transformOrigin: "left center",
                borderRadius: "1px",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                position: "absolute",
                top: "20%",
                left: "55%",
                width: "2px",
                height: "60%",
                background: "rgba(0,0,0,0.3)",
                transformOrigin: "top center",
                borderRadius: "1px",
              }}
            />
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function InviteEnvelope({ children, onOpened }: EnvelopeProps) {
  const [phase, setPhase] = useState<"sealed" | "opening" | "sliding" | "opened">("sealed");
  const [showParticles, setShowParticles] = useState(false);

  const handleOpened = useCallback(() => {
    onOpened?.();
  }, [onOpened]);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase("opening");
    }, 1000);

    const timer2 = setTimeout(() => {
      setPhase("sliding");
    }, 2200);

    const timer3 = setTimeout(() => {
      setPhase("opened");
      setShowParticles(true);
      handleOpened();
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [handleOpened]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
        padding: "20px",
        perspective: "1200px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #FDF8F5 0%, #F5E6E0 50%, #FDF8F5 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, rotateX: 5 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "380px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Envelope body */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1.5 / 1",
            borderRadius: "6px",
            overflow: "visible",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Envelope back face */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "6px",
              background:
                "linear-gradient(180deg, #F8F0EA 0%, #F5E6E0 40%, #EDD8CE 100%)",
              boxShadow:
                "0 20px 60px rgba(180,140,100,0.2), 0 8px 20px rgba(0,0,0,0.08)",
            }}
          />

          {/* Envelope texture overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "6px",
              opacity: 0.03,
              background:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 3px)",
              pointerEvents: "none",
            }}
          />

          {/* Envelope inner lining (visible when flap opens) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "4%",
              right: "4%",
              height: "55%",
              background:
                "linear-gradient(180deg, #D4A574 0%, #E8C9A0 60%, #F5E6E0 100%)",
              clipPath: "polygon(0% 0%, 50% 65%, 100% 0%)",
              borderRadius: "4px 4px 0 0",
              opacity: phase === "sealed" ? 0 : 0.7,
              transition: "opacity 0.5s ease",
            }}
          />

          {/* Card that slides up */}
          <motion.div
            animate={
              phase === "sliding" || phase === "opened"
                ? { y: "-75%", opacity: 1 }
                : { y: "5%", opacity: 1 }
            }
            transition={{
              duration: 1.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{
              position: "absolute",
              top: "8%",
              left: "8%",
              right: "8%",
              bottom: "8%",
              background: "linear-gradient(180deg, #FFFFFF 0%, #FEFCFA 100%)",
              borderRadius: "4px",
              boxShadow:
                "0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px 16px",
              zIndex: 5,
              overflow: "hidden",
            }}
          >
            {/* Card decorative border */}
            <div
              style={{
                position: "absolute",
                inset: "6px",
                border: "1px solid rgba(212,165,116,0.3)",
                borderRadius: "2px",
                pointerEvents: "none",
              }}
            />
            {/* Card corner ornaments */}
            {[
              { top: "8px", left: "8px" },
              { top: "8px", right: "8px" },
              { bottom: "8px", left: "8px" },
              { bottom: "8px", right: "8px" },
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  ...pos,
                  width: "12px",
                  height: "12px",
                  borderTop: pos.top ? "1.5px solid #D4A574" : "none",
                  borderBottom: pos.bottom ? "1.5px solid #D4A574" : "none",
                  borderLeft: pos.left ? "1.5px solid #D4A574" : "none",
                  borderRight: pos.right ? "1.5px solid #D4A574" : "none",
                  opacity: 0.6,
                }}
              />
            ))}
            {/* Children content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "opened" ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ position: "relative", zIndex: 2, width: "100%", textAlign: "center" }}
            >
              {children}
            </motion.div>
          </motion.div>

          {/* Envelope front bottom half */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              background:
                "linear-gradient(180deg, #F2E2D8 0%, #F5E6E0 50%, #EFD9CD 100%)",
              clipPath: "polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 50% 55%)",
              zIndex: 10,
              borderRadius: "0 0 6px 6px",
            }}
          />

          {/* Envelope front left triangle */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg, #F0DDD2 0%, #EDD5C8 100%)",
              clipPath: "polygon(0% 0%, 0% 100%, 50% 55%)",
              zIndex: 10,
              borderRadius: "6px 0 0 6px",
            }}
          />

          {/* Envelope front right triangle */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(225deg, #F0DDD2 0%, #EDD5C8 100%)",
              clipPath: "polygon(100% 0%, 100% 100%, 50% 55%)",
              zIndex: 10,
              borderRadius: "0 6px 6px 0",
            }}
          />

          {/* Envelope flap */}
          <motion.div
            animate={
              phase === "sealed"
                ? { rotateX: 0 }
                : { rotateX: -180 }
            }
            transition={{
              duration: 1.0,
              ease: [0.6, 0.05, 0.01, 0.9],
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "55%",
              transformOrigin: "top center",
              transformStyle: "preserve-3d",
              zIndex: phase === "sealed" ? 12 : 3,
            }}
          >
            {/* Flap front face */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, #EDD5C8 0%, #F2E2D8 100%)",
                clipPath: "polygon(0% 0%, 50% 90%, 100% 0%)",
                backfaceVisibility: "hidden",
                borderRadius: "6px 6px 0 0",
              }}
            >
              {/* Flap edge shadow */}
              <div
                style={{
                  position: "absolute",
                  bottom: "10%",
                  left: "15%",
                  right: "15%",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)",
                }}
              />
            </div>
            {/* Flap back face (visible when opened) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, #D4A574 0%, #E8C9A0 60%, #F5E6E0 100%)",
                clipPath: "polygon(0% 0%, 50% 90%, 100% 0%)",
                backfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
                borderRadius: "6px 6px 0 0",
              }}
            />
            {/* Wax seal on flap */}
            <WaxSeal isBreaking={phase !== "sealed"} />
          </motion.div>

          {/* Shadow under envelope */}
          <motion.div
            animate={
              phase === "opened"
                ? { opacity: 0.12, scaleX: 1.05 }
                : { opacity: 0.08, scaleX: 1 }
            }
            transition={{ duration: 0.8 }}
            style={{
              position: "absolute",
              bottom: "-20px",
              left: "5%",
              right: "5%",
              height: "20px",
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)",
              borderRadius: "50%",
              zIndex: -1,
            }}
          />
        </div>

        {/* Confetti particles */}
        <AnimatePresence>
          {showParticles && (
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "50%",
                width: 0,
                height: 0,
                zIndex: 50,
                pointerEvents: "none",
              }}
            >
              {Array.from({ length: 40 }).map((_, i) => (
                <Particle key={i} index={i} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
