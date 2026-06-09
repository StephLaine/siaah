import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = OxmlElement(m)
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_report():
    doc = Document()
    
    # Page setup - Margins
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Colors
    color_primary = RGBColor(13, 20, 64)     # Navy Blue (#0d1440)
    color_secondary = RGBColor(193, 39, 45) # Haitian Red (#C1272D)
    color_text = RGBColor(51, 51, 51)       # Dark Gray (#333333)
    color_light_gray = RGBColor(128, 128, 128)

    # Base Style modifications
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Calibri'
    style_normal.font.size = Pt(11)
    style_normal.font.color.rgb = color_text

    # Title
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_run = title.add_run("RAPPORT DE PRÉSENTATION DE PROJET")
    title_run.font.name = 'Calibri'
    title_run.font.size = Pt(22)
    title_run.font.bold = True
    title_run.font.color.rgb = color_primary
    
    # Project Name
    proj_name = doc.add_paragraph()
    proj_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    proj_run = proj_name.add_run("SIAAH\n(Système Intégré d'Administration et d'Assistance Haïtien)")
    proj_run.font.name = 'Calibri'
    proj_run.font.size = Pt(18)
    proj_run.font.bold = True
    proj_run.font.color.rgb = color_secondary

    # Subtitle
    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_run = subtitle.add_run("Structure, Technologies Utilisées et Questions Stratégiques de Soutien")
    sub_run.font.name = 'Calibri'
    sub_run.font.size = Pt(12)
    sub_run.font.italic = True
    sub_run.font.color.rgb = color_light_gray

    doc.add_paragraph().paragraph_format.space_after = Pt(20)

    # Horizontal Line
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_line.add_run("__________________________________________________________________").font.color.rgb = color_light_gray

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # --- SECTION 1 ---
    h1 = doc.add_heading(level=1)
    h1_run = h1.add_run("1. Présentation Générale")
    h1_run.font.color.rgb = color_primary
    h1_run.font.bold = True
    h1_run.font.size = Pt(14)
    
    p1 = doc.add_paragraph("Le projet SIAAH (Système Intégré d'Administration et d'Assistance Haïtien) est une solution numérique conçue pour le Ministère de l'Économie et des Finances (MEF) en Haïti. Son objectif principal est de moderniser, centraliser et simplifier la gestion administrative des véhicules à travers le pays.")
    p1.paragraph_format.line_spacing = 1.15
    p1.paragraph_format.space_after = Pt(8)

    p2 = doc.add_paragraph("Le système sert de pont d'intégration numérique entre plusieurs entités gouvernementales et institutionnelles majeures :")
    p2.paragraph_format.space_after = Pt(6)

    bullets = [
        ("La DGI (Direction Générale des Impôts) :", " pour la gestion des taxes d'immatriculation et des dossiers fiscaux."),
        ("L'OAVCT (Office d'Assurance Véhicules Contre Tiers) :", " pour la gestion et la vérification des polices d'assurance automobile obligatoires."),
        ("La DCPR (Direction de la Police de la Circulation et Routière) :", " pour la vérification de la validité des permis et la gestion des contraventions."),
        ("Le MEF (Ministère de l'Économie et des Finances) :", " pour la supervision générale et le suivi financier.")
    ]

    for title_part, text_part in bullets:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        run_bold = bp.add_run(title_part)
        run_bold.bold = True
        run_bold.font.color.rgb = color_primary
        bp.add_run(text_part)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # --- SECTION 2 ---
    h2 = doc.add_heading(level=1)
    h2_run = h2.add_run("2. Structure du Projet")
    h2_run.font.color.rgb = color_primary
    h2_run.font.bold = True
    h2_run.font.size = Pt(14)

    p_struct = doc.add_paragraph("L'application adopte une architecture découplée de type Client-Serveur (Frontend React / Backend Node.js Express) avec un script de traitement de formulaires administratifs à la racine :")
    p_struct.paragraph_format.space_after = Pt(10)

    # Create Table
    table = doc.add_table(rows=1, cols=3)
    table.style = 'Light Shading Accent 1'
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'Composant / Dossier'
    hdr_cells[1].text = 'Rôle Principal'
    hdr_cells[2].text = 'Fichiers Clés / Sous-dossiers'

    for cell in hdr_cells:
        set_cell_background(cell, "0d1440")
        set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
        for paragraph in cell.paragraphs:
            for run in paragraph.runs:
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)

    structure_data = [
        ("frontend/", "Interface utilisateur (IHM) moderne développée en React, gérée avec Vite. Comprend les vues pour les citoyens, les agents et les administrateurs.", "src/pages/ (Vues métiers)\nsrc/routes.jsx (Gestion des accès)\ntailwind.config.js (Styles CSS)"),
        ("backend/", "Serveur d'API REST sous Node.js Express. Gère la logique métier, la base de données PostgreSQL, les emails et la sécurité.", "src/app.js (Configuration API)\nsrc/config/schema.sql (Base de données)\nsrc/controllers/ (Logique métier)"),
        ("generate_haitian_form.py", "Script Python de support utilisant la librairie ReportLab pour générer un fichier PDF interactif officiel pour la cession de véhicules.", "generate_haitian_form.py (Racine du projet)")
    ]

    for comp, role, files in structure_data:
        row_cells = table.add_row().cells
        row_cells[0].text = comp
        row_cells[1].text = role
        row_cells[2].text = files
        for i, cell in enumerate(row_cells):
            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
            if i == 0:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.font.bold = True
                        run.font.color.rgb = color_primary

    doc.add_paragraph().paragraph_format.space_after = Pt(15)

    # --- SECTION 3 ---
    h3 = doc.add_heading(level=1)
    h3_run = h3.add_run("3. Technologies Utilisées")
    h3_run.font.color.rgb = color_primary
    h3_run.font.bold = True
    h3_run.font.size = Pt(14)

    # Sub-section Frontend
    h3_1 = doc.add_heading(level=2)
    h3_1_run = h3_1.add_run("A. Frontend (React 19)")
    h3_1_run.font.color.rgb = color_secondary
    h3_1_run.font.bold = True
    h3_1_run.font.size = Pt(12)

    fe_techs = [
        ("Vite & React 19 :", " Environnement d'exécution rapide et moderne pour l'application Web."),
        ("Tailwind CSS v3 & PostCSS :", " Framework utilitaire pour un design sur mesure, réactif et épuré."),
        ("React Router DOM v7 :", " Système de routage dynamique gérant les accès restreints selon le rôle (SuperAdmin, Admin, Employé, Citoyen)."),
        ("TanStack React Query v5 :", " Gestionnaire d'état asynchrone pour la synchronisation, la mise en cache et la récupération des données de l'API."),
        ("React Hook Form & Zod :", " Gestion et validation rigoureuse des formulaires côté client."),
        ("Framer Motion & Lucide React :", " Animations de micro-interactions fluides et icônes vectorielles modernes."),
        ("jsPDF & html2canvas :", " Outils client pour l'impression directe de reçus et de rapports."),
        ("Recharts :", " Visualisation de données sous forme de graphiques pour les tableaux de bord administratifs.")
    ]

    for title_part, text_part in fe_techs:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        run_bold = bp.add_run(title_part)
        run_bold.bold = True
        run_bold.font.color.rgb = color_primary
        bp.add_run(text_part)

    # Sub-section Backend
    h3_2 = doc.add_heading(level=2)
    h3_2_run = h3_2.add_run("B. Backend (Node.js Express)")
    h3_2_run.font.color.rgb = color_secondary
    h3_2_run.font.bold = True
    h3_2_run.font.size = Pt(12)

    be_techs = [
        ("Express v5 :", " Framework Web rapide et minimaliste pour l'API REST."),
        ("PostgreSQL & pg :", " Base de données relationnelle et driver de connexion avec gestion de pool."),
        ("Helmet & CORS :", " Modules de sécurité pour protéger les en-têtes HTTP et contrôler le partage des ressources entre serveurs."),
        ("JWT (jsonwebtoken) & bcryptjs :", " Authentification sans état par jetons d'accès et hachage sécurisé des mots de passe."),
        ("Joi :", " Validation des schémas d'entrée de l'API pour éviter les injections et les erreurs de type."),
        ("Multer :", " Middleware pour le téléversement (upload) de fichiers et de justificatifs requis pour les demandes."),
        ("Stripe SDK :", " Passerelle intégrée pour les paiements en ligne par carte bancaire."),
        ("Nodemailer :", " Envoi automatique de courriels pour les confirmations d'inscription et de statut.")
    ]

    for title_part, text_part in be_techs:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        run_bold = bp.add_run(title_part)
        run_bold.bold = True
        run_bold.font.color.rgb = color_primary
        bp.add_run(text_part)

    doc.add_paragraph().paragraph_format.space_after = Pt(15)

    # --- SECTION 4 ---
    h4 = doc.add_heading(level=1)
    h4_run = h4.add_run("4. Questions Stratégiques pour Soutenir le Projet")
    h4_run.font.color.rgb = color_primary
    h4_run.font.bold = True
    h4_run.font.size = Pt(14)

    p_qs = doc.add_paragraph("Afin de faire progresser le développement de SIAAH vers une version de production robuste et adaptée au contexte haïtien, voici les problématiques clés à éclaircir :")
    p_qs.paragraph_format.space_after = Pt(8)

    qs = [
        ("Intégration de paiements locaux (MonCash/Natcash) :", " Stripe est configuré, mais l'usage des cartes bancaires reste limité en Haïti. Un script test_moncash.js est déjà présent. Souhaitez-vous prioriser le développement et l'intégration complète de MonCash et Natcash ?"),
        ("Workflow inter-agences :", " Comment les dossiers d'immatriculation ou de renouvellement doivent-ils circuler entre la DGI et l'OAVCT ? Faut-il mettre en place une validation séquentielle (ex: OAVCT valide l'assurance en premier, puis la DGI valide la taxe de plaque) ?"),
        ("Génération de formulaires PDF côté serveur :", " Actuellement, un script Python génère un PDF localement. Souhaitez-vous automatiser la génération de ces PDF (comme les certificats de cession ou de plaque temporaire) directement sur le serveur lorsqu'une demande citoyenne est approuvée ?"),
        ("Canaux de notification :", " Les courriels étant moins consultés au quotidien, prévoyez-vous d'implémenter des notifications par SMS (via des opérateurs comme Digicel ou Natcom) pour avertir les usagers de l'évolution de leur dossier ou de la confirmation de leur rendez-vous ?"),
        ("Hébergement et Stockage des fichiers :", " Les pièces d'identité et photos de véhicules téléversées nécessitent un stockage important et sécurisé. Prévoyez-vous d'utiliser un service de stockage cloud dédié (ex. AWS S3) ou de les héberger en local sur vos propres serveurs physiques ?"),
        ("Double authentification (2FA) :", " Pour renforcer la sécurité des comptes des agents administratifs (qui valident des dossiers officiels), faut-il intégrer une double authentification par SMS ou via Google Authenticator ?")
    ]

    for q_title, q_desc in qs:
        qp = doc.add_paragraph()
        qp.paragraph_format.space_after = Pt(6)
        run_q = qp.add_run("• " + q_title)
        run_q.bold = True
        run_q.font.color.rgb = color_secondary
        qp.add_run(q_desc)

    doc.add_paragraph().paragraph_format.space_after = Pt(20)

    # Footer/Sign-off
    p_foot = doc.add_paragraph()
    p_foot.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run_foot = p_foot.add_run("Rapport rédigé automatiquement par l'assistant Antigravity AI\nDate : Mai 2026")
    run_foot.font.italic = True
    run_foot.font.size = Pt(9)
    run_foot.font.color.rgb = color_light_gray

    doc.save("c:\\Users\\teach\\Desktop\\Siaah-Beta\\Presentation_Projet_SIAAH.docx")
    print("Word document generated successfully at: c:\\Users\\teach\\Desktop\\Siaah-Beta\\Presentation_Projet_SIAAH.docx")

if __name__ == "__main__":
    create_report()
