import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateAttestationPDF = async (request) => {
    const element = document.getElementById(`attestation-template-${request.id}`);
    if (!element) {
        console.error("Template element not found");
        return;
    }

    // Temporarily show the template for capture
    element.style.display = 'block';
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Attestation_REQ_${request.id}.pdf`);
    } catch (error) {
        console.error("PDF Generation Error:", error);
    } finally {
        element.style.display = 'none';
    }
};
