from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor

def draw_section_header(c, text, x, y, width):
    c.setStrokeColor(HexColor("#333333"))
    c.setFillColor(HexColor("#f8f9fa"))
    c.rect(x, y - 5, width, 22, fill=1)
    c.setFillColor(HexColor("#000000"))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x + 10, y + 2, text)

def create_form():
    filename = "frontend/public/forms/transfert-vehicule-haiti.pdf"
    c = canvas.Canvas(filename, pagesize=LETTER)
    width, height = LETTER

    # Official Colors
    haitian_red = HexColor("#C1272D")
    haitian_blue = HexColor("#00209F")

    # --- TOP RIGHT LABEL ---
    c.setFont("Helvetica-BoldOblique", 7)
    c.drawRightString(width - 0.5*inch, height - 0.4*inch, "Exemplaire 1 destiné à l'ancien propriétaire")

    # --- HEADER ---
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(haitian_blue)
    c.drawString(0.5*inch, height - 0.7*inch, "RÉPUBLIQUE D'HAÏTI")
    
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(HexColor("#000000"))
    c.drawString(0.5*inch, height - 0.9*inch, "MINISTÈRE DE L'ÉCONOMIE ET DES FINANCES")
    c.drawString(0.5*inch, height - 1.05*inch, "DIRECTION GÉNÉRALE DES IMPÔTS (DGI)")
    c.drawString(0.5*inch, height - 1.2*inch, "SERVICE DE LA CIRCULATION / OAVCT")

    # Title
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(haitian_red)
    c.drawRightString(width - 0.5*inch, height - 0.8*inch, "CERTIFICAT DE CESSION")
    
    c.setFont("Helvetica-BoldOblique", 9)
    c.setFillColor(HexColor("#000000"))
    c.drawRightString(width - 0.5*inch, height - 1.0*inch, "(à remplir par l'ancien propriétaire et le nouveau propriétaire)")

    # Metadata
    c.setFont("Helvetica", 8)
    c.drawRightString(width - 0.5*inch, height - 1.2*inch, "Formulaire Officiel N° 15776*02-HT - SIAAH v1.3")

    # --- SECTION 1: LE VEHICULE ---
    y_pos = height - 1.8*inch
    draw_section_header(c, "1. LE VÉHICULE (à remplir par l'ancien propriétaire)", 0.5*inch, y_pos, width - 1*inch)
    
    y_pos -= 0.4*inch
    c.setFont("Helvetica-Bold", 8)
    c.drawString(0.5*inch, y_pos, "(A) Numéro d'immatriculation (Plaque) :")
    c.acroForm.textfield(name='plaque', x=2.5*inch, y=y_pos-5, width=1.5*inch, height=18)

    c.drawString(4.5*inch, y_pos, "(E) Numéro d'identification (VIN/Châssis) :")
    c.acroForm.textfield(name='vin', x=6.5*inch, y=y_pos-5, width=1.5*inch, height=18)

    y_pos -= 0.4*inch
    c.drawString(0.5*inch, y_pos, "(D.1) Marque :")
    c.acroForm.textfield(name='marque', x=1.3*inch, y=y_pos-5, width=1.0*inch, height=18)

    c.drawString(2.5*inch, y_pos, "(D.2) Type, variante, version :")
    c.acroForm.textfield(name='modele', x=3.8*inch, y=y_pos-5, width=1.5*inch, height=18)

    c.drawString(5.5*inch, y_pos, "(J.1) Genre National :")
    c.acroForm.textfield(name='genre', x=6.8*inch, y=y_pos-5, width=1.2*inch, height=18)

    y_pos -= 0.4*inch
    c.drawString(0.5*inch, y_pos, "Kilométrage inscrit au compteur :")
    c.acroForm.textfield(name='km', x=2.5*inch, y=y_pos-5, width=1.0*inch, height=18)
    c.drawString(3.6*inch, y_pos, "km")
    
    c.drawString(4.5*inch, y_pos, "Certificat d'immatriculation :")
    c.acroForm.checkbox(name='cert_oui', x=6.2*inch, y=y_pos-5, size=12)
    c.drawString(6.4*inch, y_pos, "Oui")
    c.acroForm.checkbox(name='cert_non', x=6.9*inch, y=y_pos-5, size=12)
    c.drawString(7.1*inch, y_pos, "Non (Motif : )")
    c.acroForm.textfield(name='motif_abs', x=7.8*inch, y=y_pos-5, width=1.0*inch, height=18)

    # --- SECTION 2: ANCIEN PROPRIÉTAIRE ---
    y_pos -= 0.6*inch
    draw_section_header(c, "2. ANCIEN PROPRIÉTAIRE (VENDEUR)", 0.5*inch, y_pos, width - 1*inch)
    
    y_pos -= 0.35*inch
    c.acroForm.checkbox(name='vend_p', x=0.5*inch, y=y_pos-5, size=10)
    c.drawString(0.7*inch, y_pos, "Personne physique / Entreprise individuelle")
    c.acroForm.checkbox(name='vend_m', x=3.0*inch, y=y_pos-5, size=10)
    c.drawString(3.2*inch, y_pos, "Personne morale")
    c.drawString(5.5*inch, y_pos, "Sexe :")
    c.acroForm.checkbox(name='v_m', x=6.0*inch, y=y_pos-5, size=10); c.drawString(6.2*inch, y_pos, "M")
    c.acroForm.checkbox(name='v_f', x=6.6*inch, y=y_pos-5, size=10); c.drawString(6.8*inch, y_pos, "F")

    y_pos -= 0.4*inch
    c.drawString(0.5*inch, y_pos, "NOM ET PRÉNOMS / RAISON SOCIALE :")
    c.acroForm.textfield(name='v_nom', x=2.5*inch, y=y_pos-5, width=3.5*inch, height=18)
    c.drawString(6.2*inch, y_pos, "N° SIRET/NIF :")
    c.acroForm.textfield(name='v_siret', x=7.0*inch, y=y_pos-5, width=1.0*inch, height=18)

    y_pos -= 0.4*inch
    c.drawString(0.5*inch, y_pos, "ADRESSE COMPLÈTE :")
    c.acroForm.textfield(name='v_adr', x=1.8*inch, y=y_pos-5, width=6.2*inch, height=18)

    y_pos -= 0.4*inch
    c.drawString(0.5*inch, y_pos, "Certifie avoir cédé le véhicule ci-dessus le :")
    c.acroForm.textfield(name='v_date', x=3.2*inch, y=y_pos-5, width=1.0*inch, height=18)
    c.drawString(4.3*inch, y_pos, "à")
    c.acroForm.textfield(name='v_h', x=4.5*inch, y=y_pos-5, width=1.0*inch, height=18)
    c.drawString(5.6*inch, y_pos, "Cocher :")
    c.acroForm.checkbox(name='v_cl1', x=6.2*inch, y=y_pos-5, size=10); c.drawString(6.4*inch, y_pos, "Céder")
    c.acroForm.checkbox(name='v_cl2', x=7.0*inch, y=y_pos-5, size=10); c.drawString(7.2*inch, y_pos, "Détruire")

    y_pos -= 0.3*inch
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, y_pos, "Je certifie avoir remis au nouveau propriétaire un certificat de situation administrative et que le véhicule n'a pas subi de transformation notable.")

    # --- SECTION 3: NOUVEAU PROPRIÉTAIRE ---
    y_pos -= 0.6*inch
    draw_section_header(c, "3. NOUVEAU PROPRIÉTAIRE (ACHETEUR)", 0.5*inch, y_pos, width - 1*inch)
    
    y_pos -= 0.35*inch
    c.acroForm.checkbox(name='ach_p', x=0.5*inch, y=y_pos-5, size=10); c.drawString(0.7*inch, y_pos, "Physique")
    c.acroForm.checkbox(name='ach_m', x=1.8*inch, y=y_pos-5, size=10); c.drawString(2.0*inch, y_pos, "Morale")
    c.drawString(5.5*inch, y_pos, "Sexe :")
    c.acroForm.checkbox(name='a_m', x=6.0*inch, y=y_pos-5, size=10); c.drawString(6.2*inch, y_pos, "M")
    c.acroForm.checkbox(name='a_f', x=6.6*inch, y=y_pos-5, size=10); c.drawString(6.8*inch, y_pos, "F")

    y_pos -= 0.4*inch
    c.drawString(0.5*inch, y_pos, "NOM ET PRÉNOMS / RAISON SOCIALE :")
    c.acroForm.textfield(name='a_nom', x=2.5*inch, y=y_pos-5, width=5.5*inch, height=18)

    y_pos -= 0.4*inch
    c.drawString(0.5*inch, y_pos, "NÉ(E) LE :")
    c.acroForm.textfield(name='a_birth', x=1.5*inch, y=y_pos-5, width=1.5*inch, height=18)
    c.drawString(3.2*inch, y_pos, "À :")
    c.acroForm.textfield(name='a_place', x=3.5*inch, y=y_pos-5, width=4.5*inch, height=18)

    y_pos -= 0.4*inch
    c.drawString(0.5*inch, y_pos, "CIN / PIÈCE D'ID :")
    c.acroForm.textfield(name='a_cin', x=1.8*inch, y=y_pos-5, width=2.2*inch, height=18)
    c.drawString(4.5*inch, y_pos, "NIF (Matricule Fiscal) :")
    c.acroForm.textfield(name='a_nif', x=6.2*inch, y=y_pos-5, width=1.8*inch, height=18)

    y_pos -= 0.4*inch
    c.drawString(0.5*inch, y_pos, "ADRESSE :")
    c.acroForm.textfield(name='a_adr', x=1.2*inch, y=y_pos-5, width=6.8*inch, height=18)

    y_pos -= 0.35*inch
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, y_pos, "Certifie acquérir le véhicule aux dates et heures indiquées par l'ancien propriétaire et avoir été informé de la situation administrative.")

    # --- SIGNATURES ---
    y_pos -= 0.8*inch
    c.setFont("Helvetica-Bold", 10)
    c.drawString(1.0*inch, y_pos, "Signature du Vendeur")
    c.drawString(5.0*inch, y_pos, "Signature de l'Acheteur")
    
    y_pos -= 0.7*inch
    c.line(0.8*inch, y_pos, 3.2*inch, y_pos)
    c.line(4.8*inch, y_pos, 7.2*inch, y_pos)
    
    y_pos -= 0.2*inch
    c.setFont("Helvetica", 7)
    c.drawString(0.8*inch, y_pos, "Fait à ................................., le ..../..../202...")
    c.drawString(4.8*inch, y_pos, "Fait à ................................., le ..../..../202...")

    # --- PRIVACY ---
    y_pos -= 0.45*inch
    c.acroForm.checkbox(name='privacy', x=0.5*inch, y=y_pos-3, size=10)
    c.drawString(0.7*inch, y_pos, "Je m'oppose à la réutilisation de mes données personnelles à des fins de prospection commerciale.")

    # Footer
    c.setFont("Helvetica-Oblique", 7)
    c.setFillColor(HexColor("#777777"))
    c.drawCentredString(width/2, 0.4*inch, "Document généré par SIAAH - Système Intégré des Activités Administratives d'Haïti. Usage officiel DGI/OAVCT.")

    c.save()
    print("Definitive hyper-detailed PDF created.")

if __name__ == "__main__":
    create_form()
