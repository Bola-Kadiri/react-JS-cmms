import json

def deep_merge(base, updates):
    for key, value in updates.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            deep_merge(base[key], value)
        else:
            base[key] = value
    return base

en_patch = {
    "paymentRequisition": {
        "detail": {
            "pipeline": {
                "title": "Approval Progress",
                "submitted": "Submitted",
                "pendingApproval": "Pending Approval",
                "approved": "Approved",
                "approvedBannerTitle": "Payment Requisition Approved",
                "approvedBannerDescription": "This payment requisition has been fully approved.",
                "pendingBannerTitle": "Awaiting Approval From",
                "noApproversAssigned": "No approvers assigned"
            }
        }
    }
}

fr_patch = {
    "paymentRequisition": {
        "detail": {
            "pipeline": {
                "title": "Progression de l'approbation",
                "submitted": "Soumis",
                "pendingApproval": "En attente d'approbation",
                "approved": "Approuvé",
                "approvedBannerTitle": "Réquisition de paiement approuvée",
                "approvedBannerDescription": "Cette réquisition de paiement a été entièrement approuvée.",
                "pendingBannerTitle": "En attente d'approbation de",
                "noApproversAssigned": "Aucun approbateur assigné"
            }
        }
    }
}

en_path = r'c:\Users\KadiriJimoh\Downloads\alpha-cmms-master (1)\alpha-cmms-master\src\locales\en\work.json'
with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)
deep_merge(en_data, en_patch)
with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)
print('EN OK')

fr_path = r'c:\Users\KadiriJimoh\Downloads\alpha-cmms-master (1)\alpha-cmms-master\src\locales\fr\work.json'
with open(fr_path, 'r', encoding='utf-8') as f:
    fr_data = json.load(f)
deep_merge(fr_data, fr_patch)
with open(fr_path, 'w', encoding='utf-8') as f:
    json.dump(fr_data, f, indent=2, ensure_ascii=False)
print('FR OK')
