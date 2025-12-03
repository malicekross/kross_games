import zipfile
import os

zip_path = 'public/shelter_war/assets/post-apocalyptic-set.zip'
extract_to = 'public/shelter_war/assets/downloaded_pack'

if not os.path.exists(extract_to):
    os.makedirs(extract_to)

with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_to)

print(f"Extracted to {extract_to}")
for root, dirs, files in os.walk(extract_to):
    for file in files:
        print(os.path.join(root, file))
