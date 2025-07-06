import requests

patients = [
    {
        "patient_id": "P002",
        "first_name": "Jane",
        "last_name": "Smith",
        "date_of_birth": "1985-05-12",
        "gender": "F",
        "diagnosis": "Breast cancer"
    },
    {
        "patient_id": "P003",
        "first_name": "Bob",
        "last_name": "Johnson",
        "date_of_birth": "1972-09-23",
        "gender": "M",
        "diagnosis": "Lung cancer"
    },
    {
        "patient_id": "P004",
        "first_name": "Alice",
        "last_name": "Williams",
        "date_of_birth": "1995-11-30",
        "gender": "F",
        "diagnosis": "Brain tumor"
    }
]

for patient in patients:
    response = requests.post(
        "http://localhost:8000/api/v1/patients/",
        json=patient
    )
    if response.status_code in [200, 201]:
        print(f"✅ Created {patient['first_name']} {patient['last_name']} ({patient['patient_id']})")
    else:
        print(f"❌ Failed to create {patient['first_name']} {patient['last_name']}: {response.text}")