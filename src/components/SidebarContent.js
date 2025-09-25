import React from 'react';
import './SidebarContent.css';

const SidebarContent = ({ selectedContent }) => {
  const renderContent = () => {
    switch (selectedContent) {
      case 'presentation':
        return (
          <div className="content-section">
            <h2>Presentation du Service d'Immatriculation</h2>
            <p>Brève description expliquant les services d'immatriculation offerts.</p>
          </div>
        );
      
      case 'types-operations':
        return (
          <div className="content-section">
            <h2>Type d'opération disponibles</h2>
            
            <div className="operation-detail">
              <h3>Nouvelle Immatriculation</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Première demande d'immatriculation d'un véhicule neuf ou importé n'ayant jamais été enregistré.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Informations personnelles du propriétaire (nom, adresse, téléphone, CIN/NIF)</li>
                      <li>Informations sur le véhicule (marque, modèle, année, type de carburant, couleur)</li>
                      <li>Numéro de châssis et moteur</li>
                      <li>Usage du véhicule (privé, commercial, gouvernemental, etc.)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Facture d'achat ou certificat de vente</li>
                    <li>Certificat de dédouanement (si importé)</li>
                    <li>Certificat de conformité (le cas échéant)</li>
                    <li>Pièce d'identité valide</li>
                    <li>Justificatif de domicile</li>
                    <li>Preuve d'assurance</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Nouvelle Immatriculation Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Modification des Informations du Véhicule</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Mettre à jour les données techniques ou esthétiques du véhicule (couleur, moteur, type de carburant, etc.).</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de plaque</li>
                      <li>Informations actuelles du véhicule</li>
                      <li>Nouvelles informations à mettre à jour</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Certificat d'immatriculation</li>
                    <li>Justificatif de modification (facture, certificat du garage, etc.)</li>
                    <li>Pièce d'identité du propriétaire</li>
                    <li>Assurance à jour</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Modifier les Informations Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Changement de Propriétaire du Véhicule</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Transfert de propriété d'un véhicule à un nouveau détenteur.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Coordonnées de l'ancien et du nouveau propriétaire</li>
                      <li>Numéro de plaque</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Acte de vente signé par les deux parties</li>
                    <li>Certificat d'immatriculation original</li>
                    <li>Pièce d'identité des deux parties</li>
                    <li>Preuve d'assurance au nom du nouveau propriétaire</li>
                    <li>Justificatif de domicile du nouveau propriétaire</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Changement de Propriétaire Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Renouvellement de la Plaque</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Demande de renouvellement périodique (ex : tous les 5 ans) d'une plaque d'immatriculation, souvent exigé par les autorités.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de plaque actuel</li>
                      <li>Coordonnées du propriétaire</li>
                      <li>Statut du véhicule (toujours en circulation ou pas)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Ancienne plaque (si disponible)</li>
                    <li>Certificat d'immatriculation précédent</li>
                    <li>Pièce d'identité</li>
                    <li>Preuve de paiement des taxes ou frais</li>
                    <li>Preuve d'assurance à jour</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Renouveller Plaque Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Remplacement de Plaque (Perdue ou Volée)</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Demande de réémission d'une plaque d'immatriculation qui a été perdue, volée ou endommagée.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de plaque (si disponible)</li>
                      <li>Coordonnées du propriétaire</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Déclaration de perte/vol délivrée par la police</li>
                    <li>Certificat d'immatriculation</li>
                    <li>Pièce d'identité</li>
                    <li>Assurance valide</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Remplacement de Plaque Maintenant →</button>
            </div>
          </div>
        );
      
      case 'tarifs':
        return (
          <div className="content-section">
            <h2>Tarification des services (HTG)</h2>
            
            <div className="pricing-info">
              <p>• Informations sur le véhicule</p>
              <button className="change-owner-btn">Changement de Proprietaire de Plaque →</button>
            </div>
            
            <div className="pricing-table">
              <table>
                <thead>
                  <tr>
                    <th>Type d'opération</th>
                    <th>Voiture particulière</th>
                    <th>Moto</th>
                    <th>Camion</th>
                    <th>Autobus</th>
                    <th>Vehicule Gouvernementale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nouvelle Immatriculation</td>
                    <td>10.00</td>
                    <td>03.00</td>
                    <td>15.00</td>
                    <td>12.00</td>
                    <td>0.00</td>
                  </tr>
                  <tr>
                    <td>Renouvellement de Plaque</td>
                    <td>05.00</td>
                    <td>01.50</td>
                    <td>08.00</td>
                    <td>06.00</td>
                    <td>Gratuit</td>
                  </tr>
                  <tr>
                    <td>Remplacement de Plaque</td>
                    <td>04.00</td>
                    <td>01.20</td>
                    <td>06.00</td>
                    <td>05.00</td>
                    <td>01.50</td>
                  </tr>
                  <tr>
                    <td>Modification d'information de Vehicule</td>
                    <td>03.00</td>
                    <td>01.00</td>
                    <td>04.50</td>
                    <td>03.5</td>
                    <td>01.50</td>
                  </tr>
                  <tr>
                    <td>Changement de Proprietaire</td>
                    <td>06.00</td>
                    <td>02.00</td>
                    <td>09.00</td>
                    <td>07.00</td>
                    <td>Non Applicable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'etapes':
        return (
          <div className="content-section">
            <h2>Procédure d'immatriculation</h2>
            
            <div className="procedure-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">Remplir le formulaire en ligne</div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">Téléverser les documents</div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">Payer les frais en ligne</div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">Attendre la validation par un employé</div>
              </div>
              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">Recevoir confirmation et récupérer la plaque</div>
              </div>
            </div>
          </div>
        );

      // Licence content cases
      case 'licence-presentation':
        return (
          <div className="content-section">
            <h2>Presentation du Service License (Permis de Conduire)</h2>
            <p>Brève description expliquant les services de license offerts.</p>
          </div>
        );

      case 'licence-types-operations':
        return (
          <div className="content-section">
            <h2>Type d'opération disponibles</h2>
            
            <div className="operation-detail">
              <h3>Nouvelle demande de Licence</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Cette opération permet à un utilisateur d'obtenir une licence de conduite pour la première fois. Le demandeur doit suivre une formation, réussir les examens théorique et pratique, et soumettre les pièces justificatives nécessaires.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Nom complet</li>
                      <li>Date et lieu de naissance</li>
                      <li>Adresse complète</li>
                      <li>Numéro d'identité</li>
                      <li>Type de véhicule concerné (voiture, moto, etc.)</li>
                      <li>Centre de formation fréquenté</li>
                      <li>Date de réussite aux examens</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Carte d'identité ou passeport valide</li>
                    <li>Certificat médical d'aptitude à la conduite</li>
                    <li>Attestation de réussite à l'examen théorique</li>
                    <li>Attestation de réussite à l'examen pratique</li>
                    <li>Photo d'identité récente</li>
                    <li>Justificatif de domicile</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Nouvelle Licence Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Renouvellement de Licence</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Permet à un conducteur dont la licence est arrivée à expiration ou arrive à échéance de la renouveler sans passer de nouveaux examens.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de l'ancienne licence</li>
                      <li>Nom et prénom</li>
                      <li>Date d'expiration de la licence</li>
                      <li>Informations à jour (adresse, numéro d'identité)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Ancienne licence</li>
                    <li>Carte d'identité ou passeport</li>
                    <li>Certificat médical (si l'âge ou les conditions l'exigent)</li>
                    <li>Photo d'identité récente</li>
                    <li>Justificatif de domicile (si adresse modifiée)</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Renouveller Licence Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Remplacement de Licence (Perdue ou Volée)</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Permet au titulaire d'une licence de demander un duplicata en cas de perte ou de vol. Le duplicata a la même validité que la licence précédente.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Nom et prénom</li>
                      <li>Numéro de licence (si connu)</li>
                      <li>Date de délivrance approximative</li>
                      <li>Adresse actuelle</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Déclaration de perte ou procès-verbal de police</li>
                    <li>Carte d'identité ou passeport</li>
                    <li>Photo d'identité récente</li>
                    <li>Justificatif de domicile</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Remplacer Permis Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Modification des Informations de la Licence</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Utilisée pour mettre à jour certaines informations figurant sur la licence : nom, adresse, état civil, etc.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de la licence</li>
                      <li>Nom et prénom</li>
                      <li>Date de naissance</li>
                      <li>Adresse</li>
                      <li>État civil</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Justificatif de modification (acte de mariage, acte de naissance, certificat de résidence, etc.)</li>
                    <li>Carte d'identité</li>
                    <li>Ancienne licence (si disponible)</li>
                    <li>Photo d'identité récente</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Modifier les Informations Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Conversion de licence étrangère</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Permet aux personnes titulaires d'un permis étranger de demander une licence locale, sous réserve d'équivalence reconnue.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Nom et prénom</li>
                      <li>Pays d'origine de la licence</li>
                      <li>Numéro de licence étrangère</li>
                      <li>Type de licence (catégorie)</li>
                      <li>Statut de résidence local</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Licence étrangère (originale)</li>
                    <li>Traduction officielle si nécessaire</li>
                    <li>Carte de résident ou visa valide</li>
                    <li>Justificatif de domicile</li>
                    <li>Certificat médical</li>
                    <li>Photo d'identité</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Convertir la Licence Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Paiement de Contravention</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Cette opération permet à l'usager de consulter les contraventions associées à son permis ou à sa plaque d'immatriculation et de procéder au paiement en ligne. Le système affiche les détails de chaque infraction et propose un reçu après règlement.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de contravention ou numéro de plaque d'immatriculation</li>
                      <li>Nom complet de l'usager (automatiquement rempli si connecté)</li>
                      <li>Adresse e-mail ou numéro de téléphone (pour la confirmation du paiement)</li>
                      <li>Mode de paiement sélectionné (carte, mobile money, etc.)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Copie du permis de conduire (si demandé pour vérification)</li>
                    <li>Capture ou copie du procès-verbal de contravention (si disponible)</li>
                    <li>Justificatif de paiement (généré après validation)</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Payer une Contravention Maintenant →</button>
            </div>
          </div>
        );

      case 'licence-tarifs':
        return (
          <div className="content-section">
            <h2>Tarification des services de licences (HTG)</h2>
            
            <div className="pricing-table">
              <table>
                <thead>
                  <tr>
                    <th>Type d'opération</th>
                    <th>Vehiculer leger(Voiture)</th>
                    <th>Moto</th>
                    <th>Vehicule Lourd(Camion,bus)</th>
                    <th>Remarques</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nouvelle demande de License</td>
                    <td>100.00</td>
                    <td>70.00</td>
                    <td>150.00</td>
                    <td>Inclut les frais d'examen</td>
                  </tr>
                  <tr>
                    <td>Remplacement de license</td>
                    <td>40.00</td>
                    <td>30.00</td>
                    <td>50.00</td>
                    <td>Sur présentation de déclaration</td>
                  </tr>
                  <tr>
                    <td>Modification d'information de la licence</td>
                    <td>30.00</td>
                    <td>20.00</td>
                    <td>40.00</td>
                    <td>Nom,adresse,etc</td>
                  </tr>
                  <tr>
                    <td>Conversion de licence étrangère</td>
                    <td>120.00</td>
                    <td>90.00</td>
                    <td>160.00</td>
                    <td>Traduction officiel Requise</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'licence-etapes':
        return (
          <div className="content-section">
            <h2>Procédure d'obtention de licence</h2>
            
            <div className="procedure-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">Remplir le formulaire en ligne</div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">Téléverser les documents</div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">Payer les frais en ligne</div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">Attendre la validation par un employé</div>
              </div>
              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">Recevoir confirmation et récupérer la plaque</div>
              </div>
            </div>
          </div>
        );

      // Assurance content cases
      case 'assurance-presentation':
        return (
          <div className="content-section">
            <h2>Presentation d'Assurance de Vehicule</h2>
            <p>Ce module permet aux utilisateurs de gérer en ligne leurs assurances de véhicule : souscription, renouvellement, modification ou résiliation d'un contrat.</p>
          </div>
        );

      case 'assurance-types-operations':
        return (
          <div className="content-section">
            <h2>Type d'opération disponibles</h2>
            
            <div className="operation-detail">
              <h3>Souscription à une nouvelle assurance</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Cette opération permet à un propriétaire de véhicule de souscrire à une assurance obligatoire pour la première fois. Le système guide l'utilisateur dans la soumission des informations et documents nécessaires.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Informations sur le véhicule (numéro de plaque, marque, modèle, année, type de carburant)</li>
                      <li>Informations personnelles du propriétaire (nom, adresse, téléphone, numéro d'identité)</li>
                      <li>Type d'assurance souhaité (responsabilité civile, tous risques, etc.)</li>
                      <li>Durée de couverture</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Copie de la carte grise du véhicule</li>
                    <li>Pièce d'identité du propriétaire</li>
                    <li>Certificat de contrôle technique (si requis)</li>
                    <li>Justificatif de domicile</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Souscrire à une Assurance Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Renouvellement d'Assurance</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Cette opération permet de prolonger la période de validité d'une assurance existante. L'utilisateur peut vérifier les anciennes informations et les mettre à jour si nécessaire.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de contrat d'assurance actuel</li>
                      <li>Numéro de plaque du véhicule</li>
                      <li>Informations mises à jour si changement (adresse, téléphone, etc.)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Ancien contrat ou attestation d'assurance</li>
                    <li>Contrôle technique à jour</li>
                    <li>Copie de la carte grise (si mise à jour)</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Renouveller Assurance Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Modification des informations du contrat</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Cette opération permet de modifier certains éléments du contrat d'assurance en cours (changement d'adresse, de conducteur principal, du type de couverture, etc.).</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de contrat</li>
                      <li>Informations à modifier (selon le cas)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Nouvelle pièce justificative selon modification (ex.: nouvelle adresse, nouvelle carte grise, etc.)</li>
                    <li>Attestation de l'assuré (si nécessaire)</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Modifier les Informations Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Résiliation de contrat d'assurance</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Permet à l'utilisateur de résilier son contrat d'assurance, généralement pour cause de vente du véhicule, changement d'assureur ou inutilisation du véhicule.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de contrat à résilier</li>
                      <li>Motif de la résiliation</li>
                      <li>Date souhaitée de résiliation</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>Lettre ou formulaire de résiliation signé</li>
                    <li>Preuve du motif (ex. : certificat de cession du véhicule)</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Annuler le Contrat Maintenant →</button>
            </div>
          </div>
        );

      case 'assurance-tarifs':
        return (
          <div className="content-section">
            <h2>Tarification des services de l'Assurance (HTG)</h2>
            
            <div className="pricing-table">
              <table>
                <thead>
                  <tr>
                    <th>Type d'opération</th>
                    <th>Moto</th>
                    <th>Voiture particulière</th>
                    <th>Véhicule utilitaire léger</th>
                    <th>Camion</th>
                    <th>Autobus/minibus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nouvelle Assurance</td>
                    <td>50.00</td>
                    <td>120.00</td>
                    <td>160.00</td>
                    <td>220.00</td>
                    <td>180.00</td>
                  </tr>
                  <tr>
                    <td>Renouvellement</td>
                    <td>45.00</td>
                    <td>100.00</td>
                    <td>140.00</td>
                    <td>220.00</td>
                    <td>160.00</td>
                  </tr>
                  <tr>
                    <td>Modification du Contrat</td>
                    <td>30.00</td>
                    <td>50.00</td>
                    <td>60.00</td>
                    <td>70.00</td>
                    <td>65.00</td>
                  </tr>
                  <tr>
                    <td>Annulation du Contrat</td>
                    <td>Gratuit</td>
                    <td>Gratuit</td>
                    <td>Gratuit</td>
                    <td>Gratuit</td>
                    <td>Gratuit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'assurance-etapes':
        return (
          <div className="content-section">
            <h2>Procédure d'assurance</h2>
            
            <div className="procedure-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">Remplir le formulaire en ligne</div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">Téléverser les documents</div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">Payer les frais en ligne</div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">Attendre la validation par un employé</div>
              </div>
              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">Recevoir confirmation et récupérer la plaque</div>
              </div>
            </div>
          </div>
        );

      // Rendez-vous content cases
      case 'rendezvous-presentation':
        return (
          <div className="content-section">
            <h2>Presentation du Service de Prise de Rendez-vous</h2>
            <p>Ce module permet aux usagers de planifier à l'avance leur visite dans un centre de service pour effectuer une opération spécifique (immatriculation, licence, assurance, etc.). Il permet une meilleure gestion des flux et réduit le temps d'attente.</p>
          </div>
        );

      case 'rendezvous-types-operations':
        return (
          <div className="content-section">
            <h2>Type d'opération disponibles</h2>
            
            <div className="operation-detail">
              <h3>Prise de Rendez-vous</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Permet à l'usager de réserver une date et une heure pour effectuer une opération administrative. L'usager peut choisir le type d'opération et la date/heure selon la disponibilité.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Type d'opération (ex. renouvellement, modification...)</li>
                      <li>Choix de date et heure selon disponibilité</li>
                      <li>Nom complet</li>
                      <li>Numéro de téléphone</li>
                      <li>Adresse e-mail</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>AUCUN DOCUMENT NECESSAIRE</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Prendre Rendez-vous Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Modification de rendez-vous</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Permet à l'utilisateur de changer la date, l'heure ou le service du rendez-vous existant. L'utilisateur peut vérifier les anciennes informations et les mettre à jour si nécessaire.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de rendez-vous</li>
                      <li>Nouvelle date/heure souhaitée</li>
                      <li>Justification (optionnelle)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>AUCUN DOCUMENT NECESSAIRE</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Modifier un Rendez-vous Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Annulation de rendez-vous</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Permet à l'usager d'annuler un rendez-vous programmé.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro du rendez-vous</li>
                      <li>Raison de l'annulation (facultative)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>AUCUN DOCUMENT NECESSAIRE</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Annuler le Rendez-vous Maintenant →</button>
            </div>

            <div className="operation-detail">
              <h3>Consultation de rendez-vous</h3>
              <div className="operation-content">
                <div className="operation-main">
                  <div className="description">
                    <h4>Description :</h4>
                    <p>Permet de vérifier les détails d'un rendez-vous déjà pris.</p>
                  </div>
                  
                  <div className="required-info">
                    <h4>Informations requises :</h4>
                    <ul>
                      <li>Numéro de rendez-vous ou adresse e-mail associée</li>
                    </ul>
                  </div>
                </div>
                
                <div className="required-docs">
                  <h4>Documents requis :</h4>
                  <ul>
                    <li>AUCUN DOCUMENT NECESSAIRE</li>
                  </ul>
                </div>
              </div>
              <button className="action-button">Consulter Rendez-vous Maintenant →</button>
            </div>
          </div>
        );

      case 'rendezvous-tarifs':
        return (
          <div className="content-section">
            <h2>Tarification des services de Rendez-vous (HTG)</h2>
            
            <div className="pricing-table">
              <table>
                <thead>
                  <tr>
                    <th>Type d'opération</th>
                    <th>Frais</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Prise de Rendez-vous</td>
                    <td>Gratuit</td>
                  </tr>
                  <tr>
                    <td>Modification de rendez-vous</td>
                    <td>Gratuit</td>
                  </tr>
                  <tr>
                    <td>Annulation</td>
                    <td>Gratuit</td>
                  </tr>
                  <tr>
                    <td>Non-présentation</td>
                    <td>10.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'rendezvous-etapes':
        return (
          <div className="content-section">
            <h2>Procédure de prise de rendez-vous</h2>
            
            <div className="procedure-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">Remplir le formulaire en ligne</div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">Choisir la date et l'heure disponibles</div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">Confirmer les informations</div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">Recevoir confirmation par e-mail/SMS</div>
              </div>
              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">Se présenter au centre à l'heure convenue</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="content-section">
            <h2>Bienvenue dans le Guide d'Immatriculation</h2>
            <p>Sélectionnez une option dans le menu de gauche pour voir les détails.</p>
          </div>
        );
    }
  };

  const getHeaderInfo = () => {
    if (selectedContent && selectedContent.startsWith('licence-')) {
      return {
        title: 'Licence - GUIDE',
        icon: '🆔',
        code: null
      };
    }
    if (selectedContent && selectedContent.startsWith('assurance-')) {
      return {
        title: 'Assurance - GUIDE',
        icon: '🛡️',
        code: null
      };
    }
    if (selectedContent && selectedContent.startsWith('rendezvous-')) {
      return {
        title: 'Prendre Rendez-vous - GUIDE',
        icon: '📅',
        code: null
      };
    }
    return {
      title: 'Immatriculation - GUIDE',
      icon: '🚗',
      code: 'XYZ 000'
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="sidebar-content">
      <div className="content-header">
        <div className="header-left">
          <span className="header-icon">{headerInfo.icon}</span>
          <h1>{headerInfo.title}</h1>
        </div>
        <div className="header-right">
          {headerInfo.code && <span className="content-code">{headerInfo.code}</span>}
          <button className="close-button">✕</button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default SidebarContent;
