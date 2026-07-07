import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo3DProps {
  photos: { url: string; caption?: string }[];
  layout?: "stack" | "carousel" | "grid";
}

const GOLD = "#D4A574";
const GOLD_LIGHT = "#E8C9A0";
const GOLD_DARK = "#B8865A";

const Photo3D = ({ photos, layout = "stack" }: Photo3DProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayPhotos = photos.slice(0, 5);

  if (layout === "grid") {
    return <GridLayout photos={displayPhotos} />;
  }

  if (layout === "carousel") {
    return (
      <CarouselLayout
        photos={displayPhotos}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    );
  }

  return (
    <StackLayout
      photos={displayPhotos}
      activeIndex={activeIndex}
      setActiveIndex={setActiveIndex}
      hoveredIndex={hoveredIndex}
      setHoveredIndex={setHoveredIndex}
    />
  );
};

/* ─── Stack Layout ─────────────────────────────────────────────── */

function StackLayout({
  photos,
  activeIndex,
  setActiveIndex,
  hoveredIndex,
  setHoveredIndex,
}: {
  photos: { url: string; caption?: string }[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (i: number | null) => void;
}) {
  const rotations = [-6, 3, -2, 5, -4];
  const offsets = [
    { x: -8, y: 4 },
    { x: 12, y: -6 },
    { x: -4, y: 8 },
    { x: 6, y: -3 },
    { x: -10, y: 5 },
  ];

  return (
    <div
      className="relative w-full max-w-md mx-auto"
      style={{ perspective: "1200px", height: "480px" }}
    >
      {photos.map((photo, index) => {
        const isActive = index === activeIndex;
        const isHovered = index === hoveredIndex;
        const stackOrder = isActive ? 10 : photos.length - index;
        const rotation = rotations[index % rotations.length];
        const offset = offsets[index % offsets.length];

        return (
          <motion.div
            key={index}
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            style={{
              zIndex: stackOrder,
              transformStyle: "preserve-3d",
            }}
            initial={{
              opacity: 0,
              rotateY: -90,
              rotateX: 20,
              z: -600,
              scale: 0.5,
            }}
            animate={{
              opacity: 1,
              rotateY: isActive ? 0 : rotation * 0.5,
              rotateX: isHovered ? -5 : isActive ? 0 : 3,
              rotateZ: isActive ? 0 : rotation,
              z: isHovered ? 80 : isActive ? 40 : -index * 30,
              x: isActive ? 0 : offset.x * 2,
              y: isActive ? 0 : offset.y * 2,
              scale: isActive ? 1 : 0.92 - index * 0.03,
            }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 20,
              delay: index * 0.15,
            }}
            onClick={() => setActiveIndex(index)}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            onTapStart={() => setHoveredIndex(index)}
          >
            {/* Breathing animation wrapper */}
            <motion.div
              animate={{
                y: [0, -4, 0],
                rotateZ: [0, 0.3, 0, -0.3, 0],
              }}
              transition={{
                duration: 4 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <PolaroidFrame photo={photo} isActive={isActive} index={index} />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Navigation dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((_, index) => (
            <motion.button
              key={index}
              className="w-2.5 h-2.5 rounded-full border-2 transition-colors"
              style={{
                borderColor: GOLD,
                backgroundColor: index === activeIndex ? GOLD : "transparent",
              }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Carousel Layout ──────────────────────────────────────────── */

function CarouselLayout({
  photos,
  activeIndex,
  setActiveIndex,
}: {
  photos: { url: string; caption?: string }[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
}) {
  const angleStep = 360 / photos.length;
  const radius = 280;

  return (
    <div
      className="relative w-full max-w-lg mx-auto"
      style={{ perspective: "1400px", height: "500px" }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${-activeIndex * angleStep}deg)`,
        }}
        animate={{ rotateY: -activeIndex * angleStep }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
      >
        {photos.map((photo, index) => {
          const angle = index * angleStep;
          return (
            <motion.div
              key={index}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
              }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              onClick={() => setActiveIndex(index)}
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <PolaroidFrame
                  photo={photo}
                  isActive={index === activeIndex}
                  index={index}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Navigation arrows */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 items-center">
        <motion.button
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
          style={{
            border: `2px solid ${GOLD}`,
            color: GOLD,
            backgroundColor: "rgba(212, 165, 116, 0.1)",
          }}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(212, 165, 116, 0.2)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() =>
            setActiveIndex((activeIndex - 1 + photos.length) % photos.length)
          }
        >
          &larr;
        </motion.button>
        <span
          className="text-sm font-medium tracking-wide"
          style={{ color: GOLD_LIGHT }}
        >
          {activeIndex + 1} / {photos.length}
        </span>
        <motion.button
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
          style={{
            border: `2px solid ${GOLD}`,
            color: GOLD,
            backgroundColor: "rgba(212, 165, 116, 0.1)",
          }}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(212, 165, 116, 0.2)" }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveIndex((activeIndex + 1) % photos.length)}
        >
          &rarr;
        </motion.button>
      </div>
    </div>
  );
}

/* ─── Grid Layout ──────────────────────────────────────────────── */

function GridLayout({ photos }: { photos: { url: string; caption?: string }[] }) {
  return (
    <div
      className="w-full max-w-2xl mx-auto grid gap-6 p-4"
      style={{
        perspective: "1000px",
        gridTemplateColumns:
          photos.length <= 2
            ? "repeat(2, 1fr)"
            : photos.length <= 4
            ? "repeat(2, 1fr)"
            : "repeat(3, 1fr)",
      }}
    >
      {photos.map((photo, index) => {
        const rotations = [-3, 2, -1, 3, -2];
        return (
          <motion.div
            key={index}
            className="flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
            initial={{
              opacity: 0,
              rotateY: -60,
              rotateX: 30,
              z: -400,
            }}
            animate={{
              opacity: 1,
              rotateY: 0,
              rotateX: 0,
              z: 0,
              rotateZ: rotations[index % rotations.length],
            }}
            transition={{
              type: "spring",
              stiffness: 70,
              damping: 18,
              delay: index * 0.2,
            }}
            whileHover={{
              z: 60,
              rotateZ: 0,
              scale: 1.08,
              transition: { type: "spring", stiffness: 200, damping: 15 },
            }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{
                duration: 3 + index * 0.7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <PolaroidFrame photo={photo} isActive={false} index={index} />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Polaroid Frame ───────────────────────────────────────────── */

function PolaroidFrame({
  photo,
  isActive,
  index,
}: {
  photo: { url: string; caption?: string };
  isActive: boolean;
  index: number;
}) {
  return (
    <motion.div
      className="relative rounded-sm overflow-visible"
      style={{
        background: "#fff",
        padding: "12px 12px 40px 12px",
        width: "clamp(200px, 60vw, 280px)",
        boxShadow: isActive
          ? `0 25px 60px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.2), 0 0 40px rgba(212, 165, 116, 0.15)`
          : `0 15px 40px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.15)`,
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        boxShadow: `0 35px 70px rgba(0,0,0,0.45), 0 15px 30px rgba(0,0,0,0.25), 0 0 50px rgba(212, 165, 116, 0.2)`,
      }}
    >
      {/* Gold accent border */}
      <div
        className="absolute inset-0 rounded-sm pointer-events-none"
        style={{
          border: `1.5px solid ${GOLD_LIGHT}`,
          opacity: isActive ? 0.6 : 0.3,
        }}
      />

      {/* Photo */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100 rounded-sm">
        <motion.img
          src={photo.url}
          alt={photo.caption || `Photo ${index + 1}`}
          className="w-full h-full object-cover"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          draggable={false}
        />

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.15) 100%)",
          }}
        />
      </div>

      {/* Caption */}
      {photo.caption && (
        <motion.p
          className="mt-3 text-center text-sm italic tracking-wide"
          style={{
            color: GOLD_DARK,
            fontFamily: "'Georgia', serif",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          {photo.caption}
        </motion.p>
      )}

      {/* Corner embellishment */}
      <div
        className="absolute top-2 right-2 w-3 h-3 opacity-30"
        style={{
          borderTop: `1.5px solid ${GOLD}`,
          borderRight: `1.5px solid ${GOLD}`,
        }}
      />
      <div
        className="absolute bottom-10 left-2 w-3 h-3 opacity-30"
        style={{
          borderBottom: `1.5px solid ${GOLD}`,
          borderLeft: `1.5px solid ${GOLD}`,
        }}
      />
    </motion.div>
  );
}

export default Photo3D;
