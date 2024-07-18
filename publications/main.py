import json
import datetime
import requests
import bibtexparser
from bs4 import BeautifulSoup


def extract_paper_ids(url):
    html_content = requests.get(url).content.decode('utf-8')
    soup = BeautifulSoup(html_content, 'html.parser')
    input_elements = soup.find_all('input', attrs={'name': 'item_id'})
    item_ids = set()

    for element in input_elements:
        item_id = element.get('value')
        if item_id:
            item_ids.add(item_id)

    return item_ids


def create_json(entries):
    current_year = datetime.date.today().year

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
        data[category] = sorted(data[category], key=lambda x: int(x['year']), reverse=True)

    return data


def main():
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
        # 'rp79354' # Leila
    ]

    paper_ids = set()

    for id in profileIds:
        paper_ids.update(extract_paper_ids('https://www.iris.unisa.it/cris/rp/{}?start=0&sortBy=-1&order=ASC&type=all&rpp=99999'.format(id)))

    response = requests.post('https://www.iris.unisa.it/references.htm', data={
        'format': 'bibtex',
        'item_id': paper_ids
    })

    if response.status_code == 200:
        bib_database = bibtexparser.loads(response.content.decode('utf-8')).entries
        with open('formatted_output.json', 'w') as json_file:
            json.dump(create_json(bib_database), json_file, separators=(',', ':'))
    else:
        print(f"Errore nella chiamata POST: {response.status_code} - {response.text}")


if __name__ == "__main__":
    main()
