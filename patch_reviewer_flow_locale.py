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
            "reviewer": "Reviewer",
            "reviewerHint": "Select one reviewer who will review this requisition before it reaches the approver.",
            "noReviewers": "No reviewers available. Ensure users with the REVIEWER role exist.",
            "flowArrow": "Then goes to Approver",
            "validation": {
                "reviewerRequired": "Please select a reviewer."
            }
        },
        "detail": {
            "pipeline": {
                "underReview": "Under Review",
                "reviewerLabel": "Reviewer",
                "approverLabel": "Approver"
            }
        }
    }
}

fr_patch = {
    "paymentRequisition": {
        "form": {
            "reviewer": "Réviseur",
            "reviewerHint": "Sélectionnez un réviseur qui examinera cette réquisition avant qu'elle n'atteigne l'approbateur.",
            "noReviewers": "Aucun réviseur disponible. Assurez-vous que des utilisateurs avec le rôle RÉVISEUR existent.",
            "flowArrow": "Puis va à l'approbateur",
            "validation": {
                "reviewerRequired": "Veuillez sélectionner un réviseur."
            }
        },
        "detail": {
            "pipeline": {
                "underReview": "En cours d'examen",
                "reviewerLabel": "Réviseur",
                "approverLabel": "Approbateur"
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
