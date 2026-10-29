
import requests
from bs4 import BeautifulSoup

URL = "https://wel.wat.edu.pl/planyzajec/zima/WEL25MX1S4.htm"  # Wstaw adres strony
OUTPUT_FILE = "assets/table.html"

headers = {
    "User-Agent": "Mozilla/5.0"
}

try:
    response = requests.get(URL, headers=headers, timeout=30)
    response.raise_for_status()
    response.encoding = response.apparent_encoding

    soup = BeautifulSoup(response.text, "html.parser")

    # Znajdź tabelę o określonym stylu
    table = soup.find(
        "table",
        style=lambda value: value is not None
        and "font-size:14px" in value.replace(" ", "")
    )

    if table is None:
        print("Nie znaleziono tabeli o wskazanym stylu.")
    else:
        # Zapisz cały element table wraz z zawartością
        with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
            file.write(str(table))

        print(f"Tabela została zapisana do pliku: {OUTPUT_FILE}")

except requests.RequestException as e:
    print(f"Błąd pobierania strony: {e}")
