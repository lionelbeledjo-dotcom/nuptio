const GOLD_COLOR = "#D4A574";
const A5_WIDTH_MM = 148;
const A5_HEIGHT_MM = 210;
const BORDER_MM = 4;
const WATERMARK_FONT_SIZE = 7;

export async function exportInvitationPdf(
  elementId: string,
  filename?: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#FFFFFF",
    logging: false,
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
  });

  pdf.setDrawColor(GOLD_COLOR);
  pdf.setLineWidth(0.8);
  pdf.roundedRect(
    BORDER_MM,
    BORDER_MM,
    A5_WIDTH_MM - BORDER_MM * 2,
    A5_HEIGHT_MM - BORDER_MM * 2,
    2,
    2,
    "S"
  );

  const contentMargin = BORDER_MM + 3;
  const maxWidth = A5_WIDTH_MM - contentMargin * 2;
  const maxHeight = A5_HEIGHT_MM - contentMargin * 2 - 8;

  const imgAspectRatio = canvas.width / canvas.height;
  let imgWidth = maxWidth;
  let imgHeight = imgWidth / imgAspectRatio;

  if (imgHeight > maxHeight) {
    imgHeight = maxHeight;
    imgWidth = imgHeight * imgAspectRatio;
  }

  const xOffset = (A5_WIDTH_MM - imgWidth) / 2;
  const yOffset = (A5_HEIGHT_MM - imgHeight - 8) / 2;

  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);

  pdf.setFontSize(WATERMARK_FONT_SIZE);
  pdf.setTextColor(GOLD_COLOR);
  pdf.text(
    "Créé avec Nuptio",
    A5_WIDTH_MM / 2,
    A5_HEIGHT_MM - BORDER_MM - 2,
    { align: "center" }
  );

  const outputFilename = filename || "invitation.pdf";
  const safeName = outputFilename.endsWith(".pdf")
    ? outputFilename
    : `${outputFilename}.pdf`;

  pdf.save(safeName);
}
