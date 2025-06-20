# RentHome

RentHome to aplikacja webowa do zarządzania wynajmowanymi nieruchomościami, umożliwiająca właścicielom mieszkań łatwe prowadzenie ewidencji lokali, najemców, umów, wyposażenia oraz zużycia mediów.

---

## Spis treści

- [Funkcje](#funkcje)
- [Wymagania](#wymagania)
- [Instalacja](#instalacja)
- [Konfiguracja bazy danych](#konfiguracja-bazy-danych)
- [Struktura projektu](#struktura-projektu)
- [Licencja](#licencja)

---

## Funkcje

- Rejestracja i logowanie użytkowników (właścicieli mieszkań)
- Zarządzanie nieruchomościami (dodawanie, edycja, usuwanie, przeglądanie)
- Ewidencja najemców i umów najmu
- Dodawanie i zarządzanie wyposażeniem mieszkań
- Rejestrowanie i przeglądanie zużycia mediów (woda, prąd, gaz)
- Statystyki użytkownika (liczba mieszkań, średnia powierzchnia, dochody, zużycie mediów)
- Responsywny frontend (React)

---

## Wymagania

- Node.js (zalecana wersja 18+)
- MySQL (zalecana wersja 8+)
- npm

---

## Instalacja

1. **Sklonuj repozytorium:**
   ```sh
   git clone https://github.com/Julo-coder/RentHome.git
   cd RentHome
   ```

2. **Zainstaluj zależności backendu:**
   ```sh
   npm install
   ```

3. **Zainstaluj zależności frontendu:**
   ```sh
   cd frontend
   npm install
   cd ..
   ```

---

## Konfiguracja bazy danych

1. **Utwórz bazę danych i tabele:**

   W pliku [`RentHome.sql`](sql/RentHome.sql) znajduje się pełny skrypt tworzący bazę danych i tabele. Plik ten znajduje się w folderze `sql`. Uruchom go w swojej konsoli MySQL:

   ```sh
   mysql -u root -p < sql/RentHome.sql
   ```

2. **(Opcjonalnie) Dodaj przykładowe dane:**

   > **Uwaga:** Przed wykonaniem tego kroku musisz mieć już utworzonego użytkownika w bazie danych, ponieważ domyślnie nie istnieje żaden użytkownik i bez tego pojawią się błędy podczas wstawiania przykładowych danych.
   >

   ```sh
   mysql -u root -p < sql/ExampleInserts.sql
   ```

3. **Upewnij się, że dane dostępowe do bazy w [`server.js`](server.js) są poprawne:**
   ```js
   // server.js
   const db = mysql.createPool({
       host: "localhost",
       user: "root",
       password: "hasło do MySQL server na roota",
       database: "RentHome",
       ...
   });
   ```

---

## Uruchamianie aplikacji

1. **Backend (Express + MySQL):**
   ```sh
   node server.js
   ```
   lub (jeśli masz zainstalowany `nodemon`):
   ```sh
   npx nodemon server.js
   ```

2. **Frontend (React):**
   ```sh
   cd frontend
   npm start
   ```

   Frontend domyślnie działa na [http://localhost:3000](http://localhost:3000), backend na [http://localhost:8081](http://localhost:8081).

---

## Struktura projektu

```
RentHome/
├── .gitignore
├── README.md
├── package.json
├── server.js
├── sql/
│   ├── RentHome.sql
│   ├── ExampleInserts.sql
├── frontend/
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   └── img/
│   │       ├── android-chrome-192x192.png
│   │       ├── android-chrome-512x512.png
│   │       ├── apple-touch-icon.png
│   │       ├── favicon-16x16.png
│   │       ├── favicon-32x32.png
│   │       ├── favicon.ico
│   │       └── site.webmanifest
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── components/
│       │   ├── AddContractModal.js
│       │   ├── AddEquipmentModal.js
│       │   ├── AddEstateModal.js
│       │   ├── AddUsageModal.js
│       │   ├── ContractDetailsModal.js
│       │   ├── Details.js
│       │   ├── EditEquipmentModal.js
│       │   └── ...
│       └── styles/
│           ├── const.css
│           ├── details.css
│           ├── estate.css
│           ├── header.css
│           ├── home.css
│           ├── index.css
│           ├── login.css
│           ├── modal.css
│           ├── navbar.css
│           ├── popup.css
│           ├── profile.css
│           ├── register.css
│           └── reset.css
```
---

## Licencja

Projekt udostępniany na licencji ISC.

---

**Autor:** [Julo-coder](https://github.com/Julo-coder)