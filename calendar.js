// Mapowanie rzymskich numerów miesięcy na polskie nazwy i skróty
const MONTHS_MAP = {
    "I":   { name: "STYCZEŃ",    short: "I" },
    "II":  { name: "LUTY",       short: "II" },
    "III": { name: "MARZEC",     short: "III" },
    "IV":  { name: "KWIECIEŃ",   short: "IV" },
    "V":   { name: "MAJ",        short: "V" },
    "VI":  { name: "CZERWIEC",   short: "VI" },
    "VII": { name: "LIPIEC",    short: "VII" },
    "VIII":{ name: "SIERPIEŃ",   short: "VIII" },
    "IX":  { name: "WRZESIEŃ",   short: "IX" },
    "X":   { name: "PAŹDZIERNIK",short: "X" },
    "XI":  { name: "LISTOPAD",   short: "XI" },
    "XII": { name: "GRUDZIEŃ",   short: "XII" }
};

// Odwrotne mapowanie (z liczby 1-12 na cyfrę rzymską)
const INT_TO_ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// Definicja etykiet bloków godzinowych (wektor 7x1)
const TIME_SLOTS = [
    { title: "Blok 1-2",   time: "08:00 – 09:35" },
    { title: "Blok 3-4",   time: "09:50 – 11:25" },
    { title: "Blok 5-6",   time: "11:40 – 13:15" },
    { title: "Blok 7-8",   time: "13:30 – 15:05" },
    { title: "Blok 9-10",  time: "16:00 – 17:35" },
    { title: "Blok 11-12", time: "17:50 – 19:25" },
    { title: "Blok 13-14", time: "19:40 – 21:15" }
];

/**
 * Zwraca liczbę dni w danym miesiącu uwzględniając lata przestępne.
 */
function getDaysInMonth(monthInt, year) {
    return new Date(year, monthInt, 0).getDate();
}

/**
 * Główna funkcja generująca tabelę dla wskazanego miesiąca i roku.
 */
function create_month_table(monthRoman, year) {
    const monthData = MONTHS_MAP[monthRoman];
    if (!monthData) {
        console.error(`Nieprawidłowy miesiąc: ${monthRoman}`);
        return null;
    }

    const yearNum = parseInt(year, 10);
    const monthInt = INT_TO_ROMAN.indexOf(monthRoman); // 1 - 12
    const totalDays = getDaysInMonth(monthInt, yearNum);

    // Wyznaczenie poniedziałku pierwszego tygodnia
    const firstDayOfMonth = new Date(yearNum, monthInt - 1, 1);
    let dayOfWeek = firstDayOfMonth.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7;

    const offsetToMonday = dayOfWeek - 1; 
    const startDate = new Date(yearNum, monthInt - 1, 1 - offsetToMonday);

    // Budowanie kontenera miesiąca
    // const monthContainer = document.createElement("div");
    // monthContainer.className = "month-container";

    // // --- MECHANIZM SPRAWDZANIA AKTUALNEGO MIESIĄCA ---
    // const today = new Date();
    // const isCurrentMonth = (today.getFullYear() === yearNum) && (today.getMonth() + 1 === monthInt);
    
    // if (isCurrentMonth) {
    //     monthContainer.id = "current-month"; // Przypisujemy ID do przewijania
    //     monthContainer.classList.add("is-current"); // Opcjonalna klasa CSS do wyróżnienia
    // }
    // Budowanie kontenera miesiąca z DEDYKOWANYM ID dla każdego miesiąca

    const monthContainer = document.createElement("div");
    monthContainer.className = "month-container";
    monthContainer.id = `month-${monthRoman}-${yearNum}`; // Zawsze nadajemy unikalne ID (np. month-X-2026)

    // --- MECHANIZM SPRAWDZANIA AKTUALNEGO MIESIĄCA ---
    const today = new Date();
    const isCurrentMonth = (today.getFullYear() === yearNum) && (today.getMonth() + 1 === monthInt);
    
    if (isCurrentMonth) {
        monthContainer.dataset.current = "true";
        monthContainer.classList.add("is-current");
    }

    // Nagłówek miesiąca
    const headerDiv = document.createElement("div");
    headerDiv.className = "month-header";
    headerDiv.innerText = `${monthData.name} (1 ${monthData.short} - ${totalDays} ${monthData.short}) ${yearNum}`;
    monthContainer.appendChild(headerDiv);

    // Tabela kalendarza
    const table = document.createElement("table");
    table.className = "calendar-grid";

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th class="time-header-col">Bloki zajęć</th>
            <th>pon.</th>
            <th>wt.</th>
            <th>śr.</th>
            <th>czw.</th>
            <th>pt.</th>
            <th>sob.</th>
            <th>ndz.</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    let currentDate = new Date(startDate);

    // Zmiana na 6 tygodni (wierszy)
    for (let week = 0; week < 6; week++) {
        const tr = document.createElement("tr");

        // Kolumna z godzinami (7x1)
        const timeTd = document.createElement("td");
        timeTd.className = "time-col";
        
        let timeSlotsHtml = TIME_SLOTS.map(slot => `
            <div class="block-slot time-slot-label">
                <div class="slot-title">${slot.title}</div>
                <div class="slot-time">${slot.time}</div>
            </div>
        `).join("");

        timeTd.innerHTML = `
            <div class="day-box time-box">
                <div class="day-number">Godziny</div>
                <div class="day-content">${timeSlotsHtml}</div>
            </div>
        `;
        tr.appendChild(timeTd);

        // Zmiana na 7 dni tygodnia (Poniedziałek – Niedziela)
        for (let day = 0; day < 7; day++) {
            const td = document.createElement("td");
            
            const dayNum = currentDate.getDate();
            const currMonthInt = currentDate.getMonth() + 1;
            const currMonthRoman = INT_TO_ROMAN[currMonthInt];

            // if (currMonthInt !== monthInt) {
            //     td.className = "other-month";
            // }

            // Przygotowanie klas dla komórki td
            let classes = [];

            if (currMonthInt !== monthInt) {
                classes.push("other-month");
            }

            // day == 5 to Sobota, day == 6 to Niedziela
            if (day === 5 || day === 6) {
                classes.push("weekend");
            }

            if (classes.length > 0) {
                td.className = classes.join(" ");
            }

            let emptySlotsHtml = "";
            for (let b = 0; b < 7; b++) {
                emptySlotsHtml += `<div class="block-slot"></div>`;
            }

            const isToday = (today.getFullYear() === yearNum) && 
                            (today.getMonth() + 1 === currMonthInt) && 
                            (today.getDate() === dayNum);

            const dayNumberClass = isToday ? "day-number is-today" : "day-number";

            td.innerHTML = `
                <div class="day-box">
                    <div class="${dayNumberClass}">${dayNum} ${currMonthRoman}</div>
                    <div class="day-content">${emptySlotsHtml}</div>
                </div>
            `;

            tr.appendChild(td);
            currentDate.setDate(currentDate.getDate() + 1); // Inkrementacja o każdy kolejny dzień bez przeskoku
        }

        tbody.appendChild(tr);
    }

    // const thead = document.createElement("thead");
    // thead.innerHTML = `
    //     <tr>
    //         <th class="time-header-col">Bloki zajęć</th>
    //         <th>pon.</th>
    //         <th>wt.</th>
    //         <th>śr.</th>
    //         <th>czw.</th>
    //         <th>pt.</th>
    //     </tr>
    // `;
    // table.appendChild(thead);

    // const tbody = document.createElement("tbody");
    // let currentDate = new Date(startDate);

    // for (let week = 0; week < 5; week++) {
    //     const tr = document.createElement("tr");

    //     // Kolumna z godzinami (7x1)
    //     const timeTd = document.createElement("td");
    //     timeTd.className = "time-col";
        
    //     let timeSlotsHtml = TIME_SLOTS.map(slot => `
    //         <div class="block-slot time-slot-label">
    //             <div class="slot-title">${slot.title}</div>
    //             <div class="slot-time">${slot.time}</div>
    //         </div>
    //     `).join("");

    //     timeTd.innerHTML = `
    //         <div class="day-box time-box">
    //             <div class="day-number">Godziny</div>
    //             <div class="day-content">
    //                 ${timeSlotsHtml}
    //             </div>
    //         </div>
    //     `;
    //     tr.appendChild(timeTd);

    //     // Generowanie 5 dni tygodnia
    //     for (let day = 0; day < 5; day++) {
    //         const td = document.createElement("td");
            
    //         const dayNum = currentDate.getDate();
    //         const currMonthInt = currentDate.getMonth() + 1;
    //         const currMonthRoman = INT_TO_ROMAN[currMonthInt];

    //         if (currMonthInt !== monthInt) {
    //             td.className = "other-month";
    //         }

    //         let emptySlotsHtml = "";
    //         for (let b = 0; b < 7; b++) {
    //             emptySlotsHtml += `<div class="block-slot"></div>`;
    //         }

    //         // Sprawdzenie, czy ten konkretny dzień to dzisiaj (ten sam dzień, miesiąc i rok)
    //         const isToday = (today.getFullYear() === yearNum) && 
    //                         (today.getMonth() + 1 === currMonthInt) && 
    //                         (today.getDate() === dayNum);

    //         const dayNumberClass = isToday ? "day-number is-today" : "day-number";

    //         td.innerHTML = `
    //             <div class="day-box">
    //                 <div class="${dayNumberClass}">${dayNum} ${currMonthRoman}</div>
    //                 <div class="day-content">${emptySlotsHtml}</div>
    //             </div>
    //         `;

    //         tr.appendChild(td);
    //         currentDate.setDate(currentDate.getDate() + 1);
    //     }

    //     currentDate.setDate(currentDate.getDate() + 2); // Przeskok przez weekend
    //     tbody.appendChild(tr);
    // }

    table.appendChild(tbody);
    monthContainer.appendChild(table);

    return monthContainer;
}

/**
 * Wywołanie tworzące i wstawiające miesiąc do widoku.
 */
function create(monthRoman, year, targetSelector = "#calendar-app") {
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;
    
    const monthTable = create_month_table(monthRoman, year);
    if (monthTable) {
        targetEl.appendChild(monthTable);
    }
}

/**
 * Funkcja automatycznie przewijająca widok do aktualnego miesiąca.
 */
function scrollToCurrentMonth() {
    setTimeout(() => {
        let targetEl = document.querySelector('[data-current="true"]');
        if (!targetEl) {
            targetEl = document.querySelector(".month-container");
        }
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, 100);
}


function scrollToCurrentDay() {
    setTimeout(() => {
        // 1. Najpierw szukamy bezpośrednio komórki z dzisiejszym dniem
        let targetEl = document.querySelector(".day-number.is-today");

        // 2. Fallback: jeśli nie ma dzisiejszego dnia na widoku, szukamy aktualnego miesiąca
        if (!targetEl) {
            targetEl = document.querySelector('[data-current="true"]');
        }

        // 3. Fallback 2: jeśli nic z powyższych nie istnieje, bierzemy pierwszy miesiąc
        if (!targetEl) {
            targetEl = document.querySelector(".month-container");
        }

        // Wykonanie płynnego przewijania
        if (targetEl) {
            targetEl.scrollIntoView({
                behavior: "smooth",
                block: "center" // "center" zapewnia lepszą widoczność konkretnego dnia
            });
        }
    }, 100);
}


// ======== ======== ======== ======== ======== ======== ======== ======== ======== ======== ========
//
// ======== ======== ======== ======== ======== ======== ======== ======== ======== ======== ========
// Funkcja wczytująca przedmioty i wstawiająca tabelkę do navbar-title
async function loadSubjectsTable() {
    const titleContainer = document.querySelector(".navbar-title");
    if (!titleContainer) return;

    try {
        const response = await fetch("assets/przedmioty.json");
        const subjects = await response.json();

        // Tworzymy przycisk otwierający wykaz przedmiotów
        titleContainer.innerHTML = `
            <div class="subjects-dropdown">
                <button class="subjects-btn">📚 Wykaz Przedmiotów</button>
                <div class="subjects-modal" id="subjects-modal">
                    <table class="subjects-table">
                        <thead>
                            <tr>
                                <th>Kod</th>
                                <th>Nazwa przedmiotu</th>
                                <th>Forma / Prowadzący</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjects.map(s => `
                                <tr>
                                    <td class="sub-code" style="background-color: ${s.color};">${s.code}</td>
                                    <td class="sub-name"><b>${s.name}</b></td>
                                    <td class="sub-classes">
                                        ${s.classes.map(c => `<div><code>${c.type_hours}</code> - ${c.teacher}</div>`).join('')}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Obsługa otwierania/zamykania okna wykazu przedmiotów
        const btn = titleContainer.querySelector(".subjects-btn");
        const modal = titleContainer.querySelector("#subjects-modal");
        
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            modal.classList.toggle("open");
        });

        document.addEventListener("click", () => {
            modal.classList.remove("open");
        });

        modal.addEventListener("click", (e) => e.stopPropagation());

    } catch (err) {
        console.error("Błąd podczas wczytywania przedmioty.json:", err);
    }
}

// Wywołaj funkcję ładowania po załadowaniu DOM
document.addEventListener("DOMContentLoaded", loadSubjectsTable);
