import { useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRInviteProps {
  url: string;
  guestName?: string;
  size?: number;
}

export function QRInvite({ url, guestName, size = 200 }: QRInviteProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 40;
    const canvasSize = size + padding * 2;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);
      URL.revokeObjectURL(svgUrl);

      const link = document.createElement("a");
      const safeName = guestName
        ? guestName.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "").replace(/\s+/g, "_")
        : "invitation";
      link.download = `qr_${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = svgUrl;
  }, [url, guestName, size]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="relative rounded-2xl p-6 bg-white shadow-lg border-2"
        style={{ borderColor: "#D4A574" }}
      >
        {guestName && (
          <p
            className="text-center text-sm font-medium mb-3"
            style={{ color: "#D4A574", fontFamily: "'Playfair Display', serif" }}
          >
            {guestName}
          </p>
        )}
        <QRCodeSVG
          value={url}
          size={size}
          level="H"
          includeMargin={false}
          fgColor="#2D2D2D"
          bgColor="#FFFFFF"
        />
      </div>

      <p
        className="text-sm text-center"
        style={{ color: "#8B7355", fontFamily: "'Playfair Display', serif" }}
      >
        Scannez pour voir l'invitation
      </p>

      <button
        onClick={handleDownload}
        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md active:scale-95"
        style={{
          backgroundColor: "#D4A574",
          color: "#FFFFFF",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        Télécharger le QR Code
      </button>
    </div>
  );
}
