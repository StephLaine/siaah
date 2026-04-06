import React from 'react';

const AttestationTemplate = ({ request, id }) => {
    if (!request) return null;

    const dateStr = new Date(request.created_at).toLocaleDateString('fr-FR');
    const payDateStr = request.payment_date ? new Date(request.payment_date).toLocaleDateString('fr-FR') : 'En attente';

    const [service, operation] = (request.type || '').split(' - ');
    const details = request.details || {};
    const fullName = `${details.firstName || ''} ${details.lastName || ''}`.trim();
    const nif = details.matriculeFiscal || details.nifCin || '-';
    const categories = details.permitType || '-';

    // Haitian Colors
    const haitiBlue = '#002654';
    const haitiRed = '#CE1126';
    const black = '#000000';

    // Governmental Typography
    const govtFont = "'Times New Roman', Times, serif";
    const titleStyle = {
        fontSize: '14pt',
        fontWeight: 'bold',
        color: black,
        fontFamily: govtFont,
        paddingBottom: '2pt',
        marginBottom: '8pt',
        display: 'block'
    };
    const textStyle = { fontSize: '12pt', color: black, fontFamily: govtFont };

    const qrData = `REQ-${(request?.id || 0).toString().padStart(6, '0')}-${nif}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrData)}`;

    return (
        <div
            id={id}
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '20mm',
                backgroundColor: 'white',
                color: black,
                fontFamily: govtFont,
                display: 'none',
                position: 'fixed',
                top: '-5000px',
                left: '-5000px',
                boxSizing: 'border-box',
                lineHeight: '1.4'
            }}
        >
            {/* Header section - Official Seal style */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: `1px solid ${black}`, paddingBottom: '10px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14pt', color: haitiBlue, letterSpacing: '0.5px' }}>République d'Haïti</div>
                    <div style={{ fontSize: '11pt', color: black, marginTop: '4px', fontWeight: 'bold' }}>Ministère de l'Économie et des Finances (MEF)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18pt', fontWeight: 'bold', color: haitiRed, marginBottom: '2px' }}>SIAAH</div>
                    <div style={{ fontSize: '8pt', color: haitiBlue, fontStyle: 'italic', fontWeight: 'bold', maxWidth: '200px', lineHeight: '1.2' }}>
                        Société d'immatriculation et d'assurance et d'automobile Haïti.
                    </div>
                </div>
            </div>

            {/* Main Title Section */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{
                    fontFamily: govtFont,
                    fontSize: '18pt',
                    fontWeight: 'bold',
                    color: black,
                    display: 'inline-block',
                    paddingBottom: '5px',
                    paddingLeft: '20px',
                    paddingRight: '20px'
                }}>
                    Attestation de dépôt de dossier
                </h2>
            </div>

            {/* Certification Body */}
            <div style={{ ...textStyle, marginBottom: '25px', textAlign: 'justify', lineHeight: '1.4' }}>
                La présente attestation certifie officiellement que M./Mme/Mlle <span>{fullName}</span>, identifié(e) par le numéro d'identification fiscale (NIF) <span>{nif}</span>, a dûment complété sa demande de <span style={{ color: haitiBlue }}>{service}</span> via le portail <span style={{ color: haitiRed }}>SIAAH</span>.
            </div>

            {/* Detailed Information Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginBottom: '40px' }}>
                <div>
                    <span style={titleStyle}>Identification de la demande</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={textStyle}>
                            <span style={{ fontWeight: 'normal' }}>Dossier n° :</span> <span style={{ fontFamily: 'monospace', fontSize: '13pt' }}>REQ-{(request?.id || 0).toString().padStart(6, '0')}</span>
                        </div>
                        <div style={textStyle}>
                            <span style={{ fontWeight: 'normal' }}>Date d'émission :</span> {dateStr}
                        </div>
                        <div style={textStyle}>
                            <span style={{ fontWeight: 'normal' }}>Service requis :</span> {categories}
                        </div>
                        <div style={textStyle}>
                            <span style={{ fontWeight: 'normal' }}>État actuel :</span> <span style={{ color: haitiRed, fontWeight: 'normal' }}>Traitement en cours</span>
                        </div>
                    </div>
                </div>

                <div>
                    <span style={titleStyle}>Justificatif de paiement</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={textStyle}>
                            <span style={{ fontWeight: 'normal' }}>Statut financier :</span> <span style={{ color: '#16a34a', fontWeight: 'normal' }}>Validé / Payé</span>
                        </div>
                        <div style={textStyle}>
                            <span style={{ fontWeight: 'normal' }}>Date de transaction :</span> {payDateStr}
                        </div>
                        <div style={textStyle}>
                            <span style={{ fontWeight: 'normal' }}>Méthode :</span> {request.payment_method || 'Virement bancaire'}
                        </div>
                        <div style={textStyle}>
                            <span style={{ fontWeight: 'normal' }}>Montant acquitté :</span> <span style={{ fontWeight: 'normal' }}>{request.price ? `${parseFloat(request.price).toLocaleString()} HTG` : '2,500 HTG'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal / Procedural Notes */}
            <div style={{ ...textStyle, padding: '15px', border: `1px solid ${black}`, marginBottom: '30px', backgroundColor: '#f9f9f9' }}>
                <span>Observation importante :</span><br />
                Le délai de traitement standard est de cinq (5) jours ouvrables. La validité de cette attestation est soumise à l'exactitude des pièces fournies lors de la saisie numérique.
            </div>

            <div style={{ ...textStyle, textAlign: 'center', marginBottom: '40px' }}>
                "Ce document doit être obligatoirement présenté lors de votre convocation physique."
            </div>

            {/* Signature Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ ...textStyle, fontWeight: 'bold', marginBottom: '40px' }}>Signature de l'usager</div>
                    <div style={{ borderBottom: `1px solid ${black}`, width: '100%' }}></div>
                </div>
                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ ...textStyle, fontWeight: 'bold', marginBottom: '40px' }}>Signature de l'employé</div>
                    <div style={{ borderBottom: `1px solid ${black}`, width: '100%' }}></div>
                </div>
            </div>

            {/* Footer with Seal & QR */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 'auto',
                borderTop: `1px solid ${black}`,
                paddingTop: '20px',
                position: 'absolute',
                bottom: '30mm',
                width: '170mm'
            }}>
                <div style={{ textAlign: 'left' }}>
                    <img src={qrUrl} alt="Vérification QR" style={{ width: '38mm', height: '38mm', border: `1px solid ${black}` }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '10pt' }}>
                    <div style={{ fontWeight: 'bold', color: haitiBlue }}>Direction générale des impôts / MEF</div>
                    <div style={{ color: haitiRed, fontWeight: 'bold', fontSize: '9pt' }}>Document sécurisé</div>
                    <div style={{ fontSize: '8pt', color: black, marginTop: '10px' }}>Fait à Port-au-Prince, Haïti</div>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '15mm',
                width: '170mm',
                textAlign: 'center',
                fontSize: '10pt',
                fontStyle: 'italic',
                color: black
            }}>
                SIAAH - Plateforme officielle MEF
            </div>
        </div>
    );
};

export default AttestationTemplate;
