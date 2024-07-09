import requests
from bs4 import BeautifulSoup


def scarica_pagina(url):
    response = requests.get(url)
    return response.text
def estrai_item_id(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    input_elements = soup.find_all('input', attrs={'name': 'item_id'})
    item_ids = set()  # Utilizziamo un insieme per evitare duplicati

    for element in input_elements:
        item_id = element.get('value')
        if item_id:
            item_ids.add(item_id)

    return item_ids


profileIds = [
    'rp107661',  # Ficco
    'rp11441',  # Palmieri
    'rp17676',  # D'angelo
    'rp17078',  # Esposito
    'rp00030',  # Castiglione
    'rp00885',  # Fiore
    'rp135825',  # Fusco
    'rp79328',  # Eslam Farsimadan
    'rp81635',  # Rimoli
    'rp80959',  # Boi
]

risultati_senza_duplicati = set()

for id in profileIds:
    url = 'https://www.iris.unisa.it/cris/rp/{}?start=0&sortBy=-1&order=ASC&type=all&rpp=99999'.format(id)
    html_content = scarica_pagina(url)
    item_ids = estrai_item_id(html_content)
    risultati_senza_duplicati.update(item_ids)

print("Item_id trovati")
set_str = '\n'.join(risultati_senza_duplicati)
file_path = 'items_ids.txt'
with open(file_path, 'w') as file:
    file.write(set_str)

post_url = 'https://www.iris.unisa.it/references.htm'

data = {
    'format': 'bibtex',
    'item_id': risultati_senza_duplicati
}

response = requests.post(post_url, data=data)

if response.status_code == 200:
    with open('raw_output.bib', 'wb') as f:
        f.write(response.content)
    print("File CSV salvato correttamente.")
else:
    print(f"Errore nella chiamata POST: {response.status_code} - {response.text}")
