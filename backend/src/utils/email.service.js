const nodemailer = require('nodemailer');
const { pool } = require('../config/db');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP Credentials missing. Email not sent to:', to);
            return false;
        }

        const info = await transporter.sendMail({
            from: `"SIAAH Système" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const logCommunication = async (userId, senderId, type, subject, message) => {
    try {
        await pool.query(
            'INSERT INTO communications (user_id, sender_id, type, subject, message) VALUES ($1, $2, $3, $4, $5)',
            [userId, senderId, type, subject, message]
        );
    } catch (err) {
        console.error('Error logging communication:', err);
    }
};

const sendWelcomeEmail = async (user, password) => {
    const subject = "Bienvenue sur SIAAH - Vos identifiants";
    const textContent = `Bienvenue sur SIAAH. Vos identifiants : Email: ${user.email}, Mot de passe: ${password}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">Bienvenue sur SIAAH</h1>
            </div>
            <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
                <p>Bonjour <strong>${user.first_name} ${user.last_name}</strong>,</p>
                <p>Votre compte a été créé avec succès sur la plateforme du Système Intégré d'Administration des Affaires Haïtiennes (SIAAH).</p>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Vos identifiants de connexion :</strong></p>
                    <p style="margin: 5px 0;">Email : ${user.email}</p>
                    <p style="margin: 5px 0;">Mot de passe : ${password}</p>
                </div>
                <p>Nous vous conseillons de changer votre mot de passe dès votre première connexion.</p>
                <a href="http://localhost:5173/login" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Se connecter</a>
            </div>
            <div style="background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px;">
                Ceci est un message automatique, merci de ne pas y répondre.
            </div>
        </div>
    `;
    const sent = await sendEmail(user.email, subject, html);
    if (sent) await logCommunication(user.id, null, 'welcome', subject, textContent);
    return sent;
};

const sendRequestConfirmation = async (user, request) => {
    const subject = `Confirmation de votre demande #${request.id}`;
    const textContent = `Confirmation de réception de votre demande de ${request.type}. N° Dossier: D-${request.id}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background: #1e3a8a; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">Demande Reçue</h2>
            </div>
            <div style="padding: 30px;">
                <p>Bonjour <strong>${user.first_name}</strong>,</p>
                <p>Nous avons bien reçu votre demande de <strong>${request.type}</strong>.</p>
                <p>Numéro de dossier : <strong>D-${request.id}</strong></p>
                <p>Votre dossier est actuellement en cours de traitement par nos services. Vous recevrez une notification à chaque étape importante.</p>
                <p>Merci de votre confiance.</p>
            </div>
        </div>
    `;
    const sent = await sendEmail(user.email, subject, html);
    if (sent) await logCommunication(user.id, null, 'request_received', subject, textContent);
    return sent;
};

const sendStatusUpdateEmail = async (user, request, note = '', senderId = null) => {
    const statusLabels = {
        validated: "Validé - En attente de paiement",
        processing: "En cours d'analyse",
        completed: "Demande Terminée / Livrée",
        rejected: "Demande Refusée",
        paused: "Demande en Mise en Pause"
    };

    const statusLabel = statusLabels[request.status] || request.status;
    const subject = `Mise à jour de votre dossier D-${request.id}`;
    const textContent = `Le statut de votre dossier D-${request.id} a changé pour : ${statusLabel}. ${note ? 'Note: ' + note : ''}`;

    let actionExtra = '';
    if (request.status === 'validated') {
        actionExtra = `
            <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border-left: 4px solid #f59e0b; color: #92400e;">
                <strong>Action requise :</strong> Votre dossier a été validé par l'administration. Veuillez procéder au paiement des frais pour finaliser votre demande.
            </div>
        `;
    }

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background: #1e3a8a; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">Suivi de votre dossier</h2>
            </div>
            <div style="padding: 30px;">
                <p>Bonjour ${user.first_name},</p>
                <p>Le statut de votre dossier <strong>D-${request.id}</strong> (${request.type}) a été mis à jour :</p>
                <p style="font-size: 18px; color: #2563eb; font-weight: bold;">${statusLabel}</p>
                ${note ? `<p><strong>Note de l'administration :</strong><br/>${note}</p>` : ''}
                ${actionExtra}
                <p style="margin-top: 20px;">Vous pouvez suivre l'avancement détaillé en vous connectant sur votre espace usager.</p>
            </div>
        </div>
    `;
    const sent = await sendEmail(user.email, subject, html);
    if (sent) await logCommunication(user.id, senderId, 'status_update', subject, textContent);
    return sent;
};

const sendCustomMessageEmail = async (user, subject, message, authorName, senderId) => {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background: #1e3a8a; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">Nouveau Message Administratif</h2>
            </div>
            <div style="padding: 30px;">
                <p>Bonjour ${user.first_name},</p>
                <p>Un administrateur de SIAAH (${authorName}) vous a envoyé un message concernant votre compte ou vos dossiers :</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 20px 0;">
                    ${message.replace(/\n/g, '<br/>')}
                </div>
                <p>Pour répondre à ce message ou fournir des pièces complémentaires, veuillez vous connecter à votre espace.</p>
            </div>
        </div>
    `;
    const sent = await sendEmail(user.email, subject, html);
    if (sent) await logCommunication(user.id, senderId, 'custom', subject, message);
    return sent;
};

module.exports = {
    sendWelcomeEmail,
    sendRequestConfirmation,
    sendStatusUpdateEmail,
    sendCustomMessageEmail
};
