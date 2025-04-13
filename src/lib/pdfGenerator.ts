import { PDFDocument, rgb, StandardFonts, PDFFont, PDFImage } from 'pdf-lib';
import fs from 'fs/promises'; // Use promises version of fs
import path from 'path';

// Define an interface for the data needed to generate the PDF
// This should align with the data fetched from Supabase
interface QuotationData {
    id: string; // Quotation ID
    created_at: string; // Request creation date
    // Profile data
    customer_company_name: string;
    customer_full_name: string | null; // Assuming 'Atención' maps to full_name
    customer_email: string; // Added for potential future use in PDF
    // Product data (assuming one product per PDF for now - extend if needed)
    article_number: string;
    model: string;
    quantity: number;
    price: number; // Parsed price
    lead_time: string; // Parsed lead time
    // Add other fields from the screenshot if needed (e.g., customer address, RFC - if available)
}

export async function generateQuotationPDF(data: QuotationData): Promise<Uint8Array> {
    console.log('--- Starting PDF Generation ---');
    console.log('Data received:', JSON.stringify(data, null, 2));

    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage(); // Default page size (Letter)
        const { width, height } = page.getSize();

        // Embed fonts
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // --- Load Logo ---
        let logoImage: PDFImage | undefined;
        try {
            // Construct path relative to the project root - Changed to logo.jpg
            const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
            console.log(`Attempting to load logo from: ${logoPath}`);
            const logoBytes = await fs.readFile(logoPath);
            logoImage = await pdfDoc.embedJpg(logoBytes); // Changed to embedJpg
            console.log('Logo loaded successfully.');
        } catch (imgError) {
            console.error('--- Error loading logo image ---', imgError);
            // Continue without logo if it fails to load
        }

        // --- Draw Logo (if loaded) ---
        if (logoImage) {
            const logoDims = logoImage.scale(0.15); // Reduced scale factor significantly
            page.drawImage(logoImage, {
                x: 50, // Left margin
                y: height - 80, // Moved slightly higher
                width: logoDims.width,
                height: logoDims.height,
            });
        }

        // --- Draw Header Text ("COTIZACIÓN") ---
        page.drawText('COTIZACIÓN', {
            x: width - 150, // Position from right
            y: height - 50, // Position from top
            font: helveticaBoldFont,
            size: 18,
            color: rgb(0, 0, 0), // Black text
        });

        // --- Static Company Info (Left) --- // Ensure this block is present and correct
        const staticInfoX = 50;
        let staticInfoY = height - 130; // Adjust Y position if needed relative to logo
        const staticLineHeight = 14;
        page.drawText('Grupo NSR HVAC y Control S.A. de C.V.', { x: staticInfoX, y: staticInfoY, font: helveticaBoldFont, size: 10 });
        staticInfoY -= staticLineHeight;
        page.drawText('Aljibe 6910', { x: staticInfoX, y: staticInfoY, font: helveticaFont, size: 10 });
        staticInfoY -= staticLineHeight;
        page.drawText('Riveras de la Silla', { x: staticInfoX, y: staticInfoY, font: helveticaFont, size: 10 });
        staticInfoY -= staticLineHeight;
        page.drawText('Guadalupe, NL', { x: staticInfoX, y: staticInfoY, font: helveticaFont, size: 10 });
        staticInfoY -= staticLineHeight;
        page.drawText('Mexico, CP 671167', { x: staticInfoX, y: staticInfoY, font: helveticaFont, size: 10 });
        staticInfoY -= staticLineHeight;
        page.drawText('RFC: GNH190304P84', { x: staticInfoX, y: staticInfoY, font: helveticaFont, size: 10 });


        // --- Dynamic Info (Right) ---
        const dynamicInfoX = width - 200;
        let dynamicInfoY = height - 70;
        const dynamicValueX = dynamicInfoX + 65;
        const dynamicLineHeight = 14;
        const formatDate = (dateString: string) => {
            try {
                return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
            } catch { return dateString; } // Fallback
        };
        const expirationDate = new Date(data.created_at);
        expirationDate.setDate(expirationDate.getDate() + 1); // Example: Expires 1 day after creation

        page.drawText('Fecha:', { x: dynamicInfoX, y: dynamicInfoY, font: helveticaBoldFont, size: 10 });
        page.drawText(formatDate(data.created_at), { x: dynamicValueX, y: dynamicInfoY, font: helveticaFont, size: 10 });
        dynamicInfoY -= dynamicLineHeight;
        page.drawText('Expiración:', { x: dynamicInfoX, y: dynamicInfoY, font: helveticaBoldFont, size: 10 });
        page.drawText(formatDate(expirationDate.toISOString()), { x: dynamicValueX, y: dynamicInfoY, font: helveticaFont, size: 10 });
        dynamicInfoY -= dynamicLineHeight;
        page.drawText('Cotización:', { x: dynamicInfoX, y: dynamicInfoY, font: helveticaBoldFont, size: 10 });
        page.drawText(data.id.substring(0, 8), { x: dynamicValueX, y: dynamicInfoY, font: helveticaFont, size: 10 }); // Show partial ID
        dynamicInfoY -= dynamicLineHeight;
        page.drawText('Cliente:', { x: dynamicInfoX, y: dynamicInfoY, font: helveticaBoldFont, size: 10 });
        page.drawText(data.customer_company_name, { x: dynamicValueX, y: dynamicInfoY, font: helveticaFont, size: 10 });
        dynamicInfoY -= dynamicLineHeight;
        page.drawText('Atención:', { x: dynamicInfoX, y: dynamicInfoY, font: helveticaBoldFont, size: 10 });
        page.drawText(data.customer_full_name ?? 'N/A', { x: dynamicValueX, y: dynamicInfoY, font: helveticaFont, size: 10 });
        // Add Reference if needed

        // --- Product Table ---
        const tableTopY = height - 250;
        const tableBottomY = height - 450; // Adjust as needed
        const tableX = 40;
        const tableWidth = width - tableX * 2;
        const headerY = tableTopY - 15;
        const rowStartY = headerY - 25;
        const rowHeight = 20;
        // Adjusted Column X positions
        const col1X = tableX + 5;   // Art Num Start
        const col2X = tableX + 120; // Modelo Start (Reduced space)
        const col3X = tableX + 300; // Cantidad Start (Shifted left)
        const col4X = tableX + 370; // Unit Price Start (Shifted left)
        const col5X = tableX + 460; // Extension Start (Shifted left, more room now)


        // Draw Header Background
        page.drawRectangle({
            x: tableX,
            y: tableTopY - 25, // Adjust position slightly
            width: tableWidth,
            height: 25, // Header height
            color: rgb(0, 0.1, 0.4), // Dark blue approximation
        });

        // Draw Header Text (White)
        const headerColor = rgb(1, 1, 1);
        page.drawText('Art Num', { x: col1X, y: headerY, font: helveticaBoldFont, size: 10, color: headerColor });
        page.drawText('Modelo', { x: col2X, y: headerY, font: helveticaBoldFont, size: 10, color: headerColor });
        page.drawText('Cantidad', { x: col3X, y: headerY, font: helveticaBoldFont, size: 10, color: headerColor });
        page.drawText('Unit Price', { x: col4X, y: headerY, font: helveticaBoldFont, size: 10, color: headerColor });
        page.drawText('Extension', { x: col5X, y: headerY, font: helveticaBoldFont, size: 10, color: headerColor });

        // Draw Table Row(s) - Assuming one product for now
        const extension = data.quantity * data.price;
        const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        page.drawText(data.article_number, { x: col1X, y: rowStartY, font: helveticaFont, size: 10 });
        page.drawText(data.model, { x: col2X, y: rowStartY, font: helveticaFont, size: 10 });
        page.drawText(data.quantity.toString(), { x: col3X + 20, y: rowStartY, font: helveticaFont, size: 10 }); // Align quantity
        page.drawText(formatCurrency(data.price), { x: col4X, y: rowStartY, font: helveticaFont, size: 10 });
        page.drawText(formatCurrency(extension), { x: col5X, y: rowStartY, font: helveticaFont, size: 10 });

        // Draw Table Lines (Optional, for clarity)
        // page.drawLine({ start: { x: tableX, y: tableTopY }, end: { x: width - tableX, y: tableTopY }, thickness: 1 });
        // page.drawLine({ start: { x: tableX, y: tableTopY - 25 }, end: { x: width - tableX, y: tableTopY - 25 }, thickness: 1 }); // Under header
        // ... draw vertical lines if needed ...

        // --- Totals ---
        const totalsX = width - 150;
        const totalsValueX = width - 90;
        let totalsY = tableBottomY - 20;
        const totalsLineHeight = 15;
        const subTotal = extension; // Extend this if multiple products
        const iva = subTotal * 0.16; // 16% IVA
        const total = subTotal + iva;

        page.drawText('SubTotal', { x: totalsX, y: totalsY, font: helveticaBoldFont, size: 10 });
        page.drawText(formatCurrency(subTotal), { x: totalsValueX, y: totalsY, font: helveticaFont, size: 10 });
        totalsY -= totalsLineHeight;
        page.drawText('IVA', { x: totalsX, y: totalsY, font: helveticaBoldFont, size: 10 });
        page.drawText(formatCurrency(iva), { x: totalsValueX, y: totalsY, font: helveticaFont, size: 10 });
        totalsY -= totalsLineHeight;
        page.drawText('TOTAL USD', { x: totalsX, y: totalsY, font: helveticaBoldFont, size: 10 });
        page.drawText(formatCurrency(total), { x: totalsValueX, y: totalsY, font: helveticaFont, size: 10 });

        // --- Notes Section ---
        const notesX = tableX;
        const notesTopY = totalsY - 30;
        const notesWidth = tableWidth;
        const notesHeaderY = notesTopY - 15;

        // Draw Notes Header Background
        page.drawRectangle({
            x: notesX,
            y: notesTopY - 25,
            width: notesWidth,
            height: 25,
            color: rgb(0, 0.1, 0.4), // Dark blue
        });
        page.drawText('Notas o Instrucciones', { x: notesX + 5, y: notesHeaderY, font: helveticaBoldFont, size: 10, color: headerColor });

        // Draw Notes Content
        let notesY = notesHeaderY - 20;
        const notesLineHeight = 12;
        page.drawText(`* Precios en Dólares Americanos`, { x: notesX + 10, y: notesY, font: helveticaFont, size: 9 });
        notesY -= notesLineHeight;
        page.drawText(`* Tiempo de entrega: ${data.lead_time}`, { x: notesX + 10, y: notesY, font: helveticaFont, size: 9 }); // Dynamic lead time
        notesY -= notesLineHeight;
        page.drawText(`* Entrega en sus instalaciones`, { x: notesX + 10, y: notesY, font: helveticaFont, size: 9 });
        notesY -= notesLineHeight;
        page.drawText(`* Incluye:`, { x: notesX + 10, y: notesY, font: helveticaFont, size: 9 });
        notesY -= notesLineHeight;
        page.drawText(`  - Flete a Mexico.`, { x: notesX + 15, y: notesY, font: helveticaFont, size: 9 });
        notesY -= notesLineHeight;
        page.drawText(`  - Impuestos e importación.`, { x: notesX + 15, y: notesY, font: helveticaFont, size: 9 });
        notesY -= notesLineHeight;
        page.drawText(`  - Flete local con entrega en sus instalaciones.`, { x: notesX + 15, y: notesY, font: helveticaFont, size: 9 });
        notesY -= notesLineHeight * 1.5; // Extra space
        page.drawText(`NOTA: Antes de hacer efectiva una compra, favor de confirmar tiempo de entrega.`, { x: notesX + 10, y: notesY, font: helveticaBoldFont, size: 9 });

        // --- Footer Info ---
        let footerY = notesY - 40;
        const footerLineHeight = 12;
        page.drawText('ZIEHL-ABEGG, INC.', { x: notesX, y: footerY, font: helveticaBoldFont, size: 9 });
        footerY -= footerLineHeight;
        page.drawText('Alan Cruz', { x: notesX, y: footerY, font: helveticaFont, size: 9 });
        footerY -= footerLineHeight;
        page.drawText('Project Engineer', { x: notesX, y: footerY, font: helveticaFont, size: 9 });
        footerY -= footerLineHeight;
        page.drawText('Móvil +52 81 2036 4745', { x: notesX, y: footerY, font: helveticaFont, size: 9 });
        footerY -= footerLineHeight;
        page.drawText('alan.cruz@ziehl-abegg.us', { x: notesX, y: footerY, font: helveticaFont, size: 9, color: rgb(0, 0, 0.8) }); // Blue link color
        footerY -= footerLineHeight;
        page.drawText('https://www.ziehl-abegg.com/en-us/', { x: notesX, y: footerY, font: helveticaFont, size: 9, color: rgb(0, 0, 0.8) });

        console.log('--- PDF Drawing Logic Completed ---');

        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save();
        console.log('--- PDF Generation Successful ---');
        return pdfBytes;

    } catch (error) {
        console.error('--- Error during PDF Generation ---', error);
        throw new Error('Failed to generate PDF.'); // Re-throw to be handled in API route
    }
}
