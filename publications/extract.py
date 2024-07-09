import bibtexparser
import json
import datetime

current_year = datetime.date.today().year

def sort_by_year(entries):
    return sorted(entries, key=lambda x: int(x['year']), reverse=True)


def create_json(entries):
    data = {
        "conference": [],
        "book": [],
        "article": [],
        "other": []
    }

    x = set();
    for entry in entries:
        if int(entry['year']) > current_year:
            entry['year'] = '0'
        entry_type = entry.get('ENTRYTYPE', 'other').lower()
        x.add(entry_type)
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


with open('raw_output.bib', 'r', encoding='utf-8') as file:
    bib_database = bibtexparser.load(file).entries
    save_json(create_json(bib_database), 'formatted_output.json')
