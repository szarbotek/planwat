from bs4 import BeautifulSoup
import json
import re

def parse_przedmioty():
    with open("przedmioty.html", "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    subjects = []
    current_subject = None

    rows = soup.find_all("tr")
    for row in rows:
        tds = row.find_all("td")
        if len(tds) < 2:
            continue

        first_td = tds[0]
        second_td = tds[1]

        # Sprawdzamy czy wiersz definiuje nowy przedmiot (posiada kolor tła)
        style = first_td.get("style", "")
        if "background-color" in style:
            bg_color = re.search(r"background-color:(#[A-Fa-f0-9]+)", style)
            color_hex = bg_color.group(1) if bg_color else "#ffffff"

            code = first_td.text.strip()
            name = second_td.text.strip()

            current_subject = {
                "code": code,
                "name": name,
                "color": color_hex,
                "classes": []
            }
            subjects.append(current_subject)
        elif current_subject:
            # Wiersz prowadzącego / formy zajęć (np. w 10, L 20)
            class_type_info = first_td.text.strip()
            teacher_name = second_td.text.strip()

            current_subject["classes"].append({
                "type_hours": class_type_info,
                "teacher": teacher_name
            })

    with open("assets/przedmioty.json", "w", encoding="utf-8") as f:
        json.dump(subjects, f, ensure_ascii=False, indent=2)

    print("Pomyślnie wygenerowano plik przedmioty.json!")

if __name__ == "__main__":
    parse_przedmioty()