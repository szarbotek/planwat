
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup, element, Tag
import pandas as pd


INPUT_FILE = Path("assets/plan.html")
OUTPUT_FILE = Path("assets//plan.json")
YEAR = 2026

MONTHS = {
    "IX": 9,
    "X": 10,
    "XI": 11,
    "XII": 12,
    "I": 1,
    "II": 2,
    "III": 3,
    "IV": 4,
    "V": 5,
    "VI": 6,
    "VII": 7,
    "VIII": 8,
}

DATE_RE = re.compile(
    r"(\d{1,2})\s+(VIII|VII|VI|V|IV|III|II|I|XII|XI|X|IX)",
    re.IGNORECASE
)

def parse_date(text):
    """Odczytuje datę, np. 05 X."""
    text = text.strip()
    match = DATE_RE.fullmatch(text)

    if not match:
        return None

    day = int(match.group(1))
    month_name = match.group(2).upper()
    month_number = MONTHS[month_name]

    year = YEAR if month_number >= 9 else YEAR + 1

    return {
        "day": day,
        "month": month_name,
        "year": year,
    }

def get_bgcolor(cell):
    """Odczytuje kolor tła z bgcolor lub style."""
    color = cell.get("bgcolor")

    if color:
        return color.strip()

    style = cell.get("style", "")

    match = re.search(
        r"background-color\s*:\s*([^;]+)",
        style,
        re.IGNORECASE
    )

    return match.group(1).strip() if match else None

def parse_work(cell):
    """Odczytuje przedmiot, typ, salę i kolor tła komórki."""

    # Domyślne wartości
    bgcolor = "#FFFFFF"

    # Jeśli komórka jest elementem HTML, odczytaj tekst i kolor.
    if isinstance(cell, Tag):
        text = cell.get_text("\n", strip=True)

        bgcolor = cell.get("bgcolor")

        if not bgcolor:
            style = cell.get("style", "")
            match = re.search(
                r"background-color\s*:\s*([^;]+)",
                style,
                re.IGNORECASE
            )
            if match:
                bgcolor = match.group(1).strip()

    # Jeśli komórka pochodzi z pandas, jest tekstem.
    elif isinstance(cell, str):
        text = cell.strip()

    else:
        return {
            "przedmiot": "",
            "typ": "",
            "sala": "",
            "bgcolor": bgcolor,
        }

    # Rozdziel tekst na linie, ponieważ HTML zawiera znaczniki <br>.
    parts = [
        part.strip()
        for part in text.splitlines()
        if part.strip()
    ]

    if len(parts) < 3:
        return {
            "przedmiot": "",
            "typ": "",
            "sala": "",
            "bgcolor": bgcolor or "#FFFFFF",
        }

    return {
        "przedmiot": parts[0],
        "typ": parts[1],
        "sala": " ".join(parts[2:]),
        "bgcolor": bgcolor or "#FFFFFF",
    }



def main():
    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Nie znaleziono pliku: {INPUT_FILE.resolve()}"
        )

    with INPUT_FILE.open("r", encoding="utf-8-sig") as file:
        soup = BeautifulSoup(file.read(), "html.parser")

    table = soup.find("table")

    if table is None:
        raise ValueError("Nie znaleziono tabeli w pliku plan.html")


    # Znajdź wiersz zawierający daty, np. 05 X, 12 X, 02 XI.
    found_dates = []
    cells_dataset = {}
    
    for row_index, row in enumerate( table.find_all("tr") ):
        
        for column_index, cell in enumerate( row.find_all(["td", "th"], recursive=False) ):
            # print( (row_index, column_index), cell )
            cells_dataset[ "{}-{}".format(row_index, column_index) ] = cell

            date = parse_date(cell.get_text(" ", strip=True))
            if date:
                found_dates.append({
                    **date,
                    "row": row_index,
                    "col": column_index,
                })

    print(f"Znaleziono dat: {len(found_dates)}")

    # Jeden obiekt JSON na jeden dzień.
    result_by_date = {}

    # # Wczytaj tabelę do pandas.
    tables_df = pd.read_html(INPUT_FILE, header=None)[0]
    # print( tables_df.iloc[ 0:5, 0:5] )

    for date in found_dates:
        key = (date["day"], date["month"], date["year"])

        r = date["row"]
        c = date["col"]
        planday =  tables_df.iloc[r+1:r+7+1, c]

        # if r > 6: continue
        # if c > 6: continue

        blocks: list[element.Tag] = [ cells_dataset.get( "{}-{}".format(r+i,c) ) for i in range(1,8) ]
        
        # print( 
        #     (r,c), 
        #     cells_dataset.get( "{}-{}".format(r,c) ),
        #     [ cells_dataset.get( "{}-{}".format(r+i,c) ) for i in range(1,8) ],
        # )

        plan = { ib: parse_work( bl ) for ib, bl in enumerate(blocks, start=1) }
        
        result_by_date[key] = {
            "day": date["day"],
            "month": date["month"],
            "year": date["year"],
            "plan": plan,
        }

    print( "Przerobiono komurek planu: ",len(result_by_date) )
    
    # Zapis JSON. 
    result = list(result_by_date.values())

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(
            result,
            file,
            ensure_ascii=False,
            indent=2
        )

    total_lessons = sum(
        len(item["plan"])
        for item in result
    )

    print(f"Zapisano plik: {OUTPUT_FILE.resolve()}")
    print(f"Liczba dat: {len(result)}")
    print(f"Liczba wpisów z zajęciami: {total_lessons}")


if __name__ == "__main__":
    main()
