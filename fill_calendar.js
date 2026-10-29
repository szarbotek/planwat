/**
 * Pobiera dane z plan.json i wypełnia nimi odpowiednie komórki w wygenerowanym kalendarzu.
 */
async function loadAndFillPlan() {
    console.log("Rozpoczynam pobieranie assets/plan.json...");
    try {
        const response = await fetch("assets/plan.json");
        console.log("Odpowiedź z serwera dla plan.json:", response.status);
        
        if (!response.ok) {
            console.warn("Nie udało się wczytać pliku assets/plan.json. Status:", response.status);
            return;
        }

        const planData = await response.json();
        console.log("Pobrane dane z assets/plan.json:", planData);

        planData.forEach(entry => {
            const { day, month, year, plan } = entry;

            // Szukamy kontenera dla danego miesiąca i roku po ID
            const monthContainer = document.getElementById(`month-${month}-${year}`);
            if (!monthContainer) {
                console.warn(`Nie znaleziono kontenera dla miesiąca: month-${month}-${year}`);
                return;
            }

            // Znajdujemy wszystkie komórki dni w danej tabeli
            const dayBoxes = monthContainer.querySelectorAll("td:not(.time-col) .day-box");

            dayBoxes.forEach(box => {
                const numberEl = box.querySelector(".day-number");
                if (!numberEl) return;

                const dayText = numberEl.innerText.trim();
                const expectedLabel = `${day} ${month}`;

                if (dayText === expectedLabel) {
                    const slots = box.querySelectorAll(".day-content .block-slot");

                    for (let i = 1; i <= 7; i++) {
                        const blockData = plan[i.toString()];
                        const slotIndex = i - 1;

                        if (blockData && slots[slotIndex]) {
                            const { przedmiot, typ, sala, bgcolor } = blockData;

                            if (przedmiot && przedmiot.trim() !== "") {
                                slots[slotIndex].innerHTML = `
                                    <div class="class-card" style="background-color: ${bgcolor || '#e2e8f0'};">
                                        <span class="class-title">${przedmiot} ${typ}</span>
                                        <span class="class-info">${sala}</span>
                                    </div>
                                `;
                            } else if (bgcolor && bgcolor.toUpperCase() !== "#FFFFFF") {
                                slots[slotIndex].style.backgroundColor = bgcolor;
                            }
                        }
                    }
                }
            });
        });

    } catch (error) {
        console.error("Błąd podczas ładowania planu:", error);
    }
}

// Bezpośrednie wywołanie nasłuchiwania w pliku
document.addEventListener("DOMContentLoaded", () => {
    loadAndFillPlan();
});