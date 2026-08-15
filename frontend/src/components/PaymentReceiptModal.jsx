import React, { useRef, useState, useEffect } from 'react';
import { Download, Printer, X, CheckCircle2, ShieldCheck, Building2, CreditCard, Smartphone, Phone, MapPin, Mail, Hash } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PaymentReceiptModal
 * -------------------
 * Displays a sleek, Stripe-style Invoice & Receipt for completed payments
 * (Virement bancaire, MonCash, Carte bancaire, etc.)
 * Preloads logo as Base64 Data URI so html2canvas captures it 100% cleanly in PDF export.
 */
const PaymentReceiptModal = ({ data, onClose }) => {
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState(null);

  useEffect(() => {
    // Preload logo image as Base64 Data URI to guarantee clean rendering in html2canvas PDF capture
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        setLogoBase64(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error preloading logo base64:', err);
      }
    };
    img.src = '/images/logo_siaah_main.png';
  }, []);

  if (!data) return null;

  const {
    requestId,
    serviceName = 'Demande de Service Administratif',
    amount = 2500,
    paymentMethod = 'Virement',
    bank = 'Sogebank',
    senderName = 'Client SIAAH',
    reference = `VIR-${Date.now().toString().slice(-8)}`,
    date = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }),
    nif = '—',
    phone = '—',
    address = '—',
    email = '—'
  } = data;

  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(requestId || Date.now().toString().slice(-4)).padStart(4, '0')}`;
  const formattedAmount = Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Recu_Paiement_SIAAH_${invoiceNumber}.pdf`);
    } catch (err) {
      console.error('PDF Download Error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getMethodIcon = () => {
    if (paymentMethod.toLowerCase().includes('moncash')) return <Smartphone size={16} color="#dc2626" />;
    if (paymentMethod.toLowerCase().includes('carte') || paymentMethod.toLowerCase().includes('credit')) return <CreditCard size={16} color="#2563eb" />;
    return <Building2 size={16} color="#0a2540" />;
  };

  const getFormattedServiceName = () => {
    if (!serviceName) return 'Demande de Service Administratif (DGI)';
    let cleaned = String(serviceName).trim();
    if (cleaned.toLowerCase() === 'permis' || cleaned.toLowerCase() === 'permis de conduire') {
      return 'Permis de Conduire — Demande de Permis';
    }
    if (cleaned.toLowerCase() === 'immatriculation') {
      return 'Immatriculation Véhicule — Service d\'Immatriculation';
    }
    if (cleaned.toLowerCase() === 'assurance' || cleaned.toLowerCase() === 'assurances') {
      return 'Assurance Véhicule — Police d\'Assurance OAVCT';
    }
    return cleaned;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: 'rgba(10, 37, 64, 0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '680px',
        boxShadow: '0 30px 90px rgba(10, 37, 64, 0.3)', overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        border: '1px solid #e6e8eb', margin: 'auto'
      }}>
        {/* Top Control Bar */}
        <div style={{
          background: '#0a2540', padding: '14px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#635bff22', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <ShieldCheck size={20} color="#00d4b1" />
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.2px' }}>
              Reçu de Paiement Officiel — SIAAH / DGI
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px',
              padding: '6px 10px', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable / Capturable Receipt Content (Stripe Invoice Style) */}
        <div ref={receiptRef} style={{ padding: '36px 40px', background: '#ffffff' }}>
          
          {/* Top Brand Accent Line */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #635bff, #00d4b1)', borderRadius: '2px', marginBottom: '28px' }} />

          {/* Receipt Header (Logo + Stripe Style Status Badge & Invoice #) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e6e8eb', paddingBottom: '24px', marginBottom: '28px' }}>
            <div style={{ maxWidth: '340px' }}>
              <img 
                src={logoBase64 || '/images/logo_siaah_main.png'} 
                alt="Logo SIAAH" 
                style={{ height: '52px', width: 'auto', objectFit: 'contain', marginBottom: '8px', display: 'block' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/logo_siaah_main.svg';
                }}
              />
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#425466', fontWeight: '500', lineHeight: '1.4' }}>
                République d'Haïti — Direction Générale des Impôts (DGI)<br />
                Ministère de l'Économie et des Finances
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#e6f7f0', border: '1px solid #a3e6cd', color: '#00875a',
                padding: '5px 14px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: '800',
                marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                <CheckCircle2 size={14} color="#00875a" />
                PAYÉ / PAID
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0a2540', fontFamily: 'monospace' }}>
                {invoiceNumber}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#727f96', marginTop: '2px' }}>
                Émis le {date}
              </div>
            </div>
          </div>

          {/* Receipt 2-Column Metadata Grid: Client (Facturé à) & Payment Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', background: '#f8f9fa', borderRadius: '10px', padding: '20px', marginBottom: '28px', border: '1px solid #e6e8eb' }}>
            {/* Column 1: Client Information */}
            <div>
              <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: '#727f96', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '8px' }}>
                Facturé à (Client)
              </span>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0a2540', marginBottom: '6px' }}>
                {senderName}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: '#425466' }}>
                {nif && nif !== '—' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Hash size={13} color="#635bff" />
                    <span><strong>NIF / CIN :</strong> {nif}</span>
                  </div>
                )}
                {phone && phone !== '—' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="#635bff" />
                    <span><strong>Tél :</strong> {phone}</span>
                  </div>
                )}
                {address && address !== '—' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="#635bff" />
                    <span><strong>Adresse :</strong> {address}</span>
                  </div>
                )}
                {email && email !== '—' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="#635bff" />
                    <span>{email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Payment Details */}
            <div>
              <span style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: '#727f96', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '8px' }}>
                Informations du Règlement
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0a2540', fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>
                {getMethodIcon()}
                <span>{paymentMethod} {bank ? `(${bank})` : ''}</span>
              </div>
              
              <div style={{ fontSize: '0.82rem', color: '#635bff', fontFamily: 'monospace', fontWeight: '700', marginTop: '4px' }}>
                Référence : {reference}
              </div>
              
              <div style={{ fontSize: '0.78rem', color: '#727f96', marginTop: '4px' }}>
                Statut : Confirmé & Authentifié par DGI
              </div>
            </div>
          </div>

          {/* Line Items Table (Stripe Style) */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '28px' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #0a2540', textAlign: 'left' }}>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', textTransform: 'uppercase', color: '#727f96', fontWeight: '700', letterSpacing: '0.6px' }}>Nature & Type de Démarche</th>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', textTransform: 'uppercase', color: '#727f96', fontWeight: '700', letterSpacing: '0.6px', textAlign: 'center' }}>Qté</th>
                <th style={{ padding: '10px 0', fontSize: '0.72rem', textTransform: 'uppercase', color: '#727f96', fontWeight: '700', letterSpacing: '0.6px', textAlign: 'right' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e6e8eb' }}>
                <td style={{ padding: '16px 0' }}>
                  <div style={{ fontWeight: '800', color: '#0a2540', fontSize: '0.95rem' }}>
                    {getFormattedServiceName()}
                  </div>
                  {requestId && (
                    <div style={{ fontSize: '0.8rem', color: '#635bff', fontWeight: '600', marginTop: '3px' }}>
                      Code Dossier : REQ-{String(requestId).padStart(3, '0')}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px 0', textAlign: 'center', color: '#425466', fontSize: '0.9rem', fontWeight: '600' }}>1</td>
                <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: '800', color: '#0a2540', fontSize: '0.98rem' }}>
                  {formattedAmount} HTG
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals Summary Section (Stripe Right-Aligned Card) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <div style={{ width: '260px', background: '#f8f9fa', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e6e8eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#425466', fontSize: '0.85rem' }}>
                <span>Sous-total :</span>
                <span>{formattedAmount} HTG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#425466', fontSize: '0.85rem' }}>
                <span>Taxes & Frais :</span>
                <span>0,00 HTG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 2px', borderTop: '1.5px solid #0a2540', marginTop: '8px', color: '#0a2540', fontWeight: '900', fontSize: '1.1rem' }}>
                <span>Total Payé :</span>
                <span style={{ color: '#00875a' }}>{formattedAmount} HTG</span>
              </div>
            </div>
          </div>

          {/* Footer Security Stamp */}
          <div style={{ borderTop: '1px dashed #cfd7df', paddingTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#727f96', fontSize: '0.75rem' }}>
              <ShieldCheck size={18} color="#00875a" />
              <span>Attestation officielle de paiement électronique délivrée par la DGI & SIAAH Haïti.</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0a2540', fontWeight: '800', letterSpacing: '0.4px' }}>
              RÉPUBLIQUE D'HAÏTI — MEF / DGI
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div style={{
          background: '#f8f9fa', padding: '18px 28px', borderTop: '1px solid #e6e8eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', background: '#e6e8eb', color: '#425466',
              border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Fermer
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '10px 18px', background: '#ffffff', color: '#0a2540',
                border: '1.5px solid #cfd7df', borderRadius: '8px', fontWeight: '700',
                fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Printer size={16} /> Imprimer
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{
                padding: '10px 22px', background: '#635bff',
                color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700',
                fontSize: '0.88rem', cursor: downloading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 14px rgba(99, 91, 255, 0.35)'
              }}
            >
              <Download size={16} />
              {downloading ? 'Génération PDF...' : 'Télécharger le Reçu (PDF)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;
