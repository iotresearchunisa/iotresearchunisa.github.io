import json
import datetime
import requests
import bibtexparser
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


def sort_by_year(entries):
    return sorted(entries, key=lambda x: int(x['year']), reverse=True)


def create_json(entries):
    data = {
        "conference": [],
        "book": [],
        "article": [],
        "other": []
    }

    for entry in entries:
        if int(entry['year']) > current_year:
            entry['year'] = '0'
		
        entry_type = entry.get('ENTRYTYPE', 'other').lower()
        if entry_type == 'inproceedings' or entry_type == 'conference':
            data['conference'].append(entry)
        elif entry_type == 'book' or entry_type == 'inbook':
            data['book'].append(entry)
        elif entry_type == 'article':
            data['article'].append(entry)
        else:
            data['other'].append(entry)

    # Sorting each category in the data dictionary
    for category in data:
        data[category] = sort_by_year(data[category])

    return data


def save_json(data, file_path):
    with open(file_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)

current_year = datetime.date.today().year
profileIds = [
    'rp107661', # Ficco
    'rp11441',  # Palmieri
    'rp17676',  # D'angelo
    'rp17078',  # Esposito
    'rp00030',  # Castiglione
    'rp00885',  # Fiore
    'rp135825', # Fusco
    'rp79328',  # Eslam
    'rp81635',  # Rimoli
    'rp80959',  # Boi
]
# rp79354 Leila

risultati_senza_duplicati = set()

for id in profileIds:
    url = 'https://www.iris.unisa.it/cris/rp/{}?start=0&sortBy=-1&order=ASC&type=all&rpp=99999'.format(id)
    html_content = scarica_pagina(url)
    item_ids = estrai_item_id(html_content)
    risultati_senza_duplicati.update(item_ids)

#print("Item_id trovati")
#set_str = '\n'.join(risultati_senza_duplicati)
#file_path = 'items_ids.txt'
#with open(file_path, 'w') as file:
#    file.write(set_str)

post_url = 'https://www.iris.unisa.it/references.htm'

data = {
    'format': 'bibtex',
    'item_id': risultati_senza_duplicati
}

response = requests.post(post_url, data=data)

if response.status_code == 200:
    bib_database = bibtexparser.loads(response.content.decode('utf-8')).entries
    save_json(create_json(bib_database), 'formatted_output.json')

#    with open('raw_output.bib', 'wb') as f:
#        f.write(response.content)
#    print("File CSV salvato correttamente.")
else:
    print(f"Errore nella chiamata POST: {response.status_code} - {response.text}")
