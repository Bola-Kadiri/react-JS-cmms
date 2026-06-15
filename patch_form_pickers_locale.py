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
        "form": {
            "workOrdersHint": "Select one or more work orders to attach to this requisition.",
            "approversHint": "Select at least one approver (APPROVER role) for this requisition.",
            "noWorkOrders": "No work orders available.",
            "noApprovers": "No approvers available. Ensure users with the APPROVER role exist.",
            "validation": {
                "workOrderRequired": "Please select at least one work order.",
                "requestToRequired": "Please select at least one approver."
            }
        }
    }
}

fr_patch = {
    "paymentRequisition": {
        "form": {
            "workOrdersHint": "Sélectionnez un ou plusieurs bons de travail à joindre à cette réquisition.",
            "approversHint": "Sélectionnez au moins un approbateur (rôle APPROBATEUR) pour cette réquisition.",
            "noWorkOrders": "Aucun bon de travail disponible.",
            "noApprovers": "Aucun approbateur disponible. Assurez-vous que des utilisateurs avec le rôle APPROBATEUR existent.",
            "validation": {
                "workOrderRequired": "Veuillez sélectionner au moins un bon de travail.",
                "requestToRequired": "Veuillez sélectionner au moins un approbateur."
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
