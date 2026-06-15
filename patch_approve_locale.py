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
            "approveButton": "Approve",
            "approveDialog": {
                "title": "Approve Payment Requisition",
                "description": "Are you sure you want to approve this payment requisition? This action cannot be undone.",
                "confirm": "Approve",
                "approving": "Approving..."
            }
        }
    }
}

fr_patch = {
    "paymentRequisition": {
        "detail": {
            "approveButton": "Approuver",
            "approveDialog": {
                "title": "Approuver la réquisition de paiement",
                "description": "Êtes-vous sûr de vouloir approuver cette réquisition de paiement ? Cette action est irréversible.",
                "confirm": "Approuver",
                "approving": "Approbation..."
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
