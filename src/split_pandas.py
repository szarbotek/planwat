
from bs4 import BeautifulSoup
from copy import copy

INPUT_FILE = "table.html"


from copy import copy
import re

def clean_cell(cell, soup):
    cloned = copy(cell)
    cloned.attrs = dict(cell.attrs)

    # Zachowaj tylko background-color z atrybutu style
    style = cloned.get("style", "")
    match = re.search(
        r"background-color\s*:\s*([^;]+)",
        style,
        re.IGNORECASE
    )

    if match:
        cloned["style"] = f"background-color:{match.group(1).strip()}"
    else:
        cloned.attrs.pop("style", None)

    # Zachowaj bgcolor, jeśli występuje
    # (przeglądarki traktują go jako kolor tła)
    # Usuń obrazek tła, wymiary i inne atrybuty prezentacyjne
    cloned.attrs.pop("background", None)
    cloned.attrs.pop("width", None)
    cloned.attrs.pop("height", None)
    cloned.attrs.pop("border", None)
    cloned.attrs.pop("align", None)
    cloned.attrs.pop("valign", None)

    # Usuń scalanie, ponieważ komórki są już rozwinięte
    cloned.attrs.pop("rowspan", None)
    cloned.attrs.pop("colspan", None)

    # Zachowaj zawartość komórki, np. b, font, p, br
    cloned.clear()
    for child in cell.contents:
        cloned.append(copy(child))

    return cloned

def expand_table(table):
    rows = []
    active = {}  # kolumna: (wiersze pozostałe, HTML komórki)

    for tr in table.find_all("tr"):
        row = []
        occupied = set()
        next_active = {}

        # Komórki przeniesione z poprzednich wierszy
        for col, (remaining, html) in active.items():
            while len(row) <= col:
                row.append(None)

            row[col] = html
            occupied.add(col)

            if remaining > 1:
                next_active[col] = (remaining - 1, html)

        col = 0

        for cell in tr.find_all(["td", "th"], recursive=False):
            rowspan = int(cell.get("rowspan", 1))
            colspan = int(cell.get("colspan", 1))

            # Szukaj wolnego obszaru dla colspan
            while any(c in occupied for c in range(col, col + colspan)):
                col += 1

            for c in range(col, col + colspan):
                while len(row) <= c:
                    row.append(None)

                # Kopia oryginalnej komórki z całym formatowaniem
                # cloned = copy(cell)
                # cloned.attrs = dict(cell.attrs)
                # cloned.attrs.pop("rowspan", None)
                # cloned.attrs.pop("colspan", None)

                # # Wyczyść zawartość, aby kopia nie zawierała
                # # zagnieżdżonych elementów tabeli
                # cloned.clear()

                # # Wstaw zawartość oryginalnej komórki
                # for child in cell.contents:
                #     cloned.append(copy(child))

                cloned = clean_cell(cell, soup)

                row[c] = cloned
                occupied.add(c)

                if rowspan > 1:
                    next_active[c] = (rowspan - 1, cloned)

            col += colspan

        rows.append(row)
        active = next_active

    # Uzupełnij brakujące komórki
    width = max(map(len, rows), default=0)

    for row in rows:
        row.extend([None] * (width - len(row)))

    return rows


with open(INPUT_FILE, "r", encoding="utf-8-sig") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

table = soup.find(
    "table",
    style=lambda s: s and "font-size:14px" in s.replace(" ", "")
)

if table is None:
    raise ValueError("Nie znaleziono tabeli")

grid = expand_table(table)

# Podział na dwie ostatnie kolumny
if len(grid[0]) < 2:
    raise ValueError("Tabela ma mniej niż 2 kolumny")

plan_grid = [row[:-2] for row in grid]
przedmioty_grid = [row[-2:] for row in grid]


def save_html(filename, rows):
    output = BeautifulSoup(
        "<!DOCTYPE html><html><head>"
        '<meta charset="utf-8">'
        "</head><body></body></html>",
        "html.parser"
    )

    new_table = output.new_tag("table")
    new_table["style"] = table.get("style", "border-collapse:collapse")

    tbody = output.new_tag("tbody")

    for source_row in rows:
        tr = output.new_tag("tr")

        for cell in source_row:
            if cell is None:
                td = output.new_tag("td")
                td.string = ""
            else:
                td = copy(cell)

            tr.append(td)

        tbody.append(tr)

    new_table.append(tbody)
    output.body.append(new_table)

    with open(filename, "w", encoding="utf-8") as f:
        f.write(str(output))


save_html("assets/plan.html", plan_grid)
save_html("assets/przedmioty.html", przedmioty_grid)

print("Zapisano plan.html i przedmioty.html z formatowaniem.")
