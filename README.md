# planwat

> Stronka internetowa służąca do przejrzystego i dynamicznego wyświetlania planu zajęć Wojskowej Akademii Technicznej (WAT).

---

## 🛠️ Technologie

Projekt wykorzystuje nowoczesne technologie frontendowe oraz narzędzia do automatyzacji danych:

### **Frontend & Serwowanie**
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

### **Backend & Przetwarzanie danych (Admin)**
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![BeautifulSoup](https://img.shields.io/badge/BeautifulSoup-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)

---

## 🚀 Uruchomienie lokalne

Ze względu na politykę bezpieczeństwa przeglądarek (CORS) dotyczącą zapytań `fetch()`, pliki danych JSON powinny być serwowane przez serwer HTTP.

1. **Uruchomienie lokalnego serwera HTTP (Python):**

```bash
   python3 -m http.server -b 127.0.0.1 8000
```

Otwarcie aplikacji:
Przejdź w przeglądarce pod adres: http://127.0.0.1:8000/index_main.html📁 Struktura i opis skryptówStruktura katalogów projektu prezentuje się następująco:

```Plaintext
.
├── assets/
│   ├── base.html
│   ├── plan.html
│   ├── plan.json           # Wygenerowana baza z blokami zajęć
│   ├── przedmioty.html
│   ├── przedmioty.json     # Wygenerowana baza z wykazem przedmiotów
│   └── table.html
├── src/
│   ├── generate_json.py    # Generowanie bazy planu do formatu JSON
│   ├── load_table.py       # Ładowanie i parsowanie tabel HTML
│   ├── parse_subjects.py   # Wyciąganie szczegółów przedmiotów i prowadzących
│   └── split_pandas.py     # Przetwarzanie i podział danych tabelarycznych (Pandas)
├── calendar.js             # Generowanie dynamicznego szkieletu siatki kalendarza (7x6)
├── fill_calendar.js        # Asynchroniczne wstrzykiwanie danych z plan.json do kalendarza
├── index_main.html         # Główny widok interfejsu aplikacji
└── style.css               # Arkusz stylów (układ 7x6, sticky navbar, wyróżnienia dni)
```

Rozbicie odpowiedzialności skryptów:

- Skrypty Python (src/): Służą wyłącznie administratorowi do przetwarzania surowych danych/HTML pozyskanych z systemu uczelnianego i przekształcania ich na gotowe pliki bazy danych w podkatalogu assets/ (plan.json oraz przedmioty.json). Aktualizacja tych plików powoduje odświeżenie danych widocznych na stronie.   

- calendar.js: Odpowiada za dynamiczne tworzenie struktury kalendarza w widoku (generowanie 12 miesięcy, układ siatki 7x6 dla dni pon–ndz, interaktywne menu nawigacyjne z rozwijaną tabelą przedmiotów oraz płynne przewijanie do dzisiejszego dnia).

- fill_calendar.js: Odpowiada za odczyt wygenerowanego pliku assets/plan.json i nakładanie pobranych bloków zajęć na wyrenderowany wcześniej szkielet kalendarza.

🐳 Wdrożenie produkcyjne (Docker)

Aplikacja kliencka może być w pełni skonteneryzowana i uruchomiona za pomocą produkcyjnego serwera Nginx (np. na porcie 2137):   Bash

# Budowanie obrazu kontenera

```bash
docker build -t planwat:latest .
```

# Uruchomienie kontenera

```bash
docker run -d \
  --name watpage-container \
  --restart always \
  -p 2137:80 \
  planwat:latest
```
