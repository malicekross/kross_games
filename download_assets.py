import urllib.request
import os

urls = [
    ('https://opengameart.org/sites/default/files/darkmale.png', 'public/shelter_war/assets/darkmale.png'),
    ('https://opengameart.org/sites/default/files/maleorcfullsheet.png', 'public/shelter_war/assets/maleorcfullsheet.png')
]

for url, out_path in urls:
    print(f"Downloading {url} to {out_path}...")
    try:
        urllib.request.urlretrieve(url, out_path)
        print("Download complete.")
    except Exception as e:
        print(f"Error downloading {url}: {e}")
