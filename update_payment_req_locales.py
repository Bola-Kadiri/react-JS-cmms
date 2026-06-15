import json

def deep_merge(base, updates):
    for key, value in updates.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value
    return base

en_additions = {
    "paymentRequisition": {
        "statusLabels": {
            "active": "Active",
            "inactive": "Inactive"
        },
        "approvalStatusLabels": {
            "request": "Pending",
            "approve": "Approved"
        },
        "statusOptions": {
            "active": "Active",
            "inactive": "Inactive"
        },
        "approvalStatusOptions": {
            "request": "Request",
            "approve": "Approved"
        },
        "columns": {
            "payTo": "Pay To",
            "expectedAmount": "Expected Amount",
            "expectedPaymentDate": "Expected Payment Date",
            "approvalStatus": "Approval Status",
            "actions": "Actions"
        },
        "form": {
            "sectionTitle": "Payment Requisition Details",
            "requisitionDate": "Requisition Date",
            "expectedPaymentDate": "Expected Payment Date",
            "payTo": "Pay To",
            "owner": "Owner",
            "expectedPaymentAmount": "Expected Payment Amount",
            "withholdingTax": "Withholding Tax",
            "status": "Status",
            "approvalStatus": "Approval Status",
            "retirement": "Retirement",
            "remark": "Remark",
            "comment": "Comment",
            "workOrders": "Work Orders",
            "requestTo": "Request To",
            "items": "Items",
            "cancel": "Cancel",
            "save": "Save",
            "update": "Update",
            "loading": "Loading payment requisition details...",
            "errorLoading": "Error loading payment requisition details",
            "errorFallback": "An unknown error occurred",
            "backToList": "Back to Payment Requisitions",
            "selectVendor": "Select a vendor",
            "selectOwner": "Select an owner",
            "selectStatus": "Select status",
            "selectApprovalStatus": "Select approval status",
            "enterAmount": "Enter amount",
            "enterTaxAmount": "Enter tax amount",
            "enterRemarks": "Enter remarks",
            "enterComments": "Enter comments",
            "statusOptions": {
                "active": "Active",
                "inactive": "Inactive"
            },
            "approvalStatusOptions": {
                "request": "Request",
                "approve": "Approve"
            },
            "validation": {
                "requisitionDateRequired": "Requisition date is required",
                "payToRequired": "Pay to is required",
                "expectedPaymentDateRequired": "Expected payment date is required",
                "expectedPaymentAmountRequired": "Expected payment amount is required",
                "ownerRequired": "Owner is required"
            }
        },
        "detail": {
            "loading": "Loading payment requisition details...",
            "error": "Error loading payment requisition details",
            "errorFallback": "An unknown error occurred",
            "notFound": "Payment requisition not found",
            "notFoundDescription": "The requested payment requisition could not be found.",
            "backToList": "Back to Payment Requisitions",
            "pageTitle": "Payment Requisition",
            "editButton": "Edit Requisition",
            "back": "Back",
            "edit": "Edit",
            "tabs": {
                "overview": "Overview",
                "items": "Payment Items ({{count}})",
                "workOrders": "Work Orders ({{count}})",
                "approvals": "Approvals ({{count}})"
            },
            "summary": {
                "expectedPayment": "Expected Payment",
                "withholdingTax": "Withholding Tax",
                "status": "Status",
                "dueOn": "Due on {{date}}",
                "taxDeduction": "Tax deduction from payment",
                "createdOn": "Created on {{date}}"
            },
            "payee": {
                "title": "Pay To",
                "description": "Details of payment recipient",
                "contact": "Contact",
                "phone": "Phone",
                "bankDetails": "Bank Details",
                "bank": "Bank",
                "accountName": "Account Name",
                "accountNumber": "Account Number",
                "currency": "Currency"
            },
            "requisitionInfo": {
                "title": "Requisition Details",
                "description": "Payment and requisition information",
                "number": "Requisition #",
                "dateCreated": "Date Created",
                "paymentDue": "Payment Due",
                "requiresRetirement": "Requires Retirement",
                "yes": "Yes",
                "no": "No",
                "remarks": "Remarks",
                "comments": "Comments"
            },
            "recipients": {
                "title": "Request Recipients",
                "description": "Users who received this payment request"
            },
            "itemsTab": {
                "title": "Payment Items ({{count}})",
                "description": "Items included in this payment requisition",
                "workOrderRef": "Work Order: #{{id}}",
                "amount": "Amount",
                "itemDescription": "Description",
                "subtotal": "Subtotal:",
                "withholdingTax": "Withholding Tax:",
                "totalPayment": "Total Payment:"
            },
            "workOrdersTab": {
                "title": "Associated Work Orders ({{count}})",
                "description": "Work orders linked to this payment requisition",
                "itemDescription": "Description",
                "facility": "Facility",
                "department": "Department",
                "apartment": "Apartment",
                "category": "Category",
                "subcategory": "Subcategory",
                "assetInfo": "Asset Information",
                "asset": "Asset",
                "serialNumber": "Serial Number",
                "status": "Status",
                "remarks": "Remarks",
                "na": "N/A",
                "noStartDate": "No start date"
            },
            "approvalsTab": {
                "title": "Approval Status",
                "approvedMessage": "This payment requisition has been approved",
                "pendingMessage": "This payment requisition is awaiting approval",
                "recipients": "Approval Recipients",
                "approvalLimit": "Approval limit: {{amount}}"
            }
        }
    }
}

fr_additions = {
    "paymentRequisition": {
        "statusLabels": {
            "active": "Actif",
            "inactive": "Inactif"
        },
        "approvalStatusLabels": {
            "request": "En attente",
            "approve": "Approuvé"
        },
        "statusOptions": {
            "active": "Actif",
            "inactive": "Inactif"
        },
        "approvalStatusOptions": {
            "request": "Demande",
            "approve": "Approuver"
        },
        "columns": {
            "payTo": "Payer à",
            "expectedAmount": "Montant prévu",
            "expectedPaymentDate": "Date de paiement prévue",
            "approvalStatus": "Statut d'approbation",
            "actions": "Actions"
        },
        "form": {
            "sectionTitle": "Détails de la réquisition de paiement",
            "requisitionDate": "Date de réquisition",
            "expectedPaymentDate": "Date de paiement prévue",
            "payTo": "Payer à",
            "owner": "Propriétaire",
            "expectedPaymentAmount": "Montant de paiement prévu",
            "withholdingTax": "Retenue à la source",
            "status": "Statut",
            "approvalStatus": "Statut d'approbation",
            "retirement": "Retraite",
            "remark": "Remarque",
            "comment": "Commentaire",
            "workOrders": "Ordres de travail",
            "requestTo": "Demander à",
            "items": "Articles",
            "cancel": "Annuler",
            "save": "Enregistrer",
            "update": "Mettre à jour",
            "loading": "Chargement des détails de la réquisition...",
            "errorLoading": "Erreur lors du chargement des détails de la réquisition de paiement",
            "errorFallback": "Une erreur inconnue s'est produite",
            "backToList": "Retour aux réquisitions de paiement",
            "selectVendor": "Sélectionner un fournisseur",
            "selectOwner": "Sélectionner un propriétaire",
            "selectStatus": "Sélectionner un statut",
            "selectApprovalStatus": "Sélectionner un statut d'approbation",
            "enterAmount": "Entrer le montant",
            "enterTaxAmount": "Entrer le montant de la taxe",
            "enterRemarks": "Entrer les remarques",
            "enterComments": "Entrer les commentaires",
            "statusOptions": {
                "active": "Actif",
                "inactive": "Inactif"
            },
            "approvalStatusOptions": {
                "request": "Demande",
                "approve": "Approuver"
            },
            "validation": {
                "requisitionDateRequired": "La date de réquisition est requise",
                "payToRequired": "La sélection du destinataire est requise",
                "expectedPaymentDateRequired": "La date de paiement prévue est requise",
                "expectedPaymentAmountRequired": "Le montant de paiement prévu est requis",
                "ownerRequired": "Le propriétaire est requis"
            }
        },
        "detail": {
            "loading": "Chargement des détails de la réquisition...",
            "error": "Erreur lors du chargement des détails de la réquisition de paiement",
            "errorFallback": "Une erreur inconnue s'est produite",
            "notFound": "Réquisition de paiement introuvable",
            "notFoundDescription": "La réquisition de paiement demandée est introuvable.",
            "backToList": "Retour aux réquisitions de paiement",
            "pageTitle": "Réquisition de paiement",
            "editButton": "Modifier la réquisition",
            "back": "Retour",
            "edit": "Modifier",
            "tabs": {
                "overview": "Aperçu",
                "items": "Articles ({{count}})",
                "workOrders": "Ordres de travail ({{count}})",
                "approvals": "Approbations ({{count}})"
            },
            "summary": {
                "expectedPayment": "Paiement prévu",
                "withholdingTax": "Retenue à la source",
                "status": "Statut",
                "dueOn": "Prévu le {{date}}",
                "taxDeduction": "Déduction fiscale du paiement",
                "createdOn": "Créé le {{date}}"
            },
            "payee": {
                "title": "Payer à",
                "description": "Détails du bénéficiaire du paiement",
                "contact": "Contact",
                "phone": "Téléphone",
                "bankDetails": "Coordonnées bancaires",
                "bank": "Banque",
                "accountName": "Nom du compte",
                "accountNumber": "Numéro de compte",
                "currency": "Devise"
            },
            "requisitionInfo": {
                "title": "Détails de la réquisition",
                "description": "Informations sur le paiement et la réquisition",
                "number": "Réquisition n°",
                "dateCreated": "Date de création",
                "paymentDue": "Paiement dû",
                "requiresRetirement": "Nécessite une retraite",
                "yes": "Oui",
                "no": "Non",
                "remarks": "Remarques",
                "comments": "Commentaires"
            },
            "recipients": {
                "title": "Destinataires de la demande",
                "description": "Utilisateurs ayant reçu cette demande de paiement"
            },
            "itemsTab": {
                "title": "Articles de paiement ({{count}})",
                "description": "Articles inclus dans cette réquisition de paiement",
                "workOrderRef": "Ordre de travail : n°{{id}}",
                "amount": "Montant",
                "itemDescription": "Description",
                "subtotal": "Sous-total :",
                "withholdingTax": "Retenue à la source :",
                "totalPayment": "Paiement total :"
            },
            "workOrdersTab": {
                "title": "Ordres de travail associés ({{count}})",
                "description": "Ordres de travail liés à cette réquisition de paiement",
                "itemDescription": "Description",
                "facility": "Établissement",
                "department": "Département",
                "apartment": "Appartement",
                "category": "Catégorie",
                "subcategory": "Sous-catégorie",
                "assetInfo": "Informations sur l'actif",
                "asset": "Actif",
                "serialNumber": "Numéro de série",
                "status": "Statut",
                "remarks": "Remarques",
                "na": "N/A",
                "noStartDate": "Pas de date de début"
            },
            "approvalsTab": {
                "title": "Statut d'approbation",
                "approvedMessage": "Cette réquisition de paiement a été approuvée",
                "pendingMessage": "Cette réquisition de paiement est en attente d'approbation",
                "recipients": "Destinataires de l'approbation",
                "approvalLimit": "Limite d'approbation : {{amount}}"
            }
        }
    }
}

en_path = r'c:\Users\KadiriJimoh\Downloads\alpha-cmms-master (1)\alpha-cmms-master\src\locales\en\work.json'
with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)
deep_merge(en_data, en_additions)
with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)
print('EN OK')

fr_path = r'c:\Users\KadiriJimoh\Downloads\alpha-cmms-master (1)\alpha-cmms-master\src\locales\fr\work.json'
with open(fr_path, 'r', encoding='utf-8') as f:
    fr_data = json.load(f)
deep_merge(fr_data, fr_additions)
with open(fr_path, 'w', encoding='utf-8') as f:
    json.dump(fr_data, f, indent=2, ensure_ascii=False)
print('FR OK')
