Build a full-stack web application for an automotive repair company called "Engineering Enterprise Motors".

The app is a quote generation tool that uses step-by-step questions and answers (via dropdowns) to compile a list of necessary repairs and generate a quote.

It must be production-ready, run in a Docker container, and use a database to store vehicles, pricing history, and supplier information.

---

### 🔧 CORE FEATURES:

#### 1. Step-by-Step Quote Builder:
- Each question is displayed in order based on previous answers (decision-tree style).
- Users answer with dropdowns or buttons.
- As answers are selected, they add items to a live quote summary.

#### 2. Quote Summary:
- Displays all repairs or services selected.
- Show estimated prices for each item.
- Total is automatically calculated.
- User can export as PDF or print.
- Use `jsPDF` or `html2pdf.js`.

#### 3. Database Integration:
Use a PostgreSQL (or SQLite) database with tables for:
- Vehicles (make, model, year, engine type, etc.)
- Past Quotes
- Services/Repairs
- Pricing (with date, price, supplier)
- Suppliers

Each time a service/part is selected, check the database for:
- Prior matching vehicle quotes
- Autofill prices if available
- If a new price is entered, prompt:
  - “Price has changed. Do you want to update it?”
  - Show previous supplier and price.

Save this update with:
- New price
- Date
- Supplier info

#### 4. Admin Panel:
- UI to manage:
  - Questions and dropdown options
  - Pricing entries
  - Supplier info
- Allow creating/editing question logic (which question follows based on answers)
- Admin panel should be secured (basic password auth is fine for now)

---

### 💾 DATABASE DESIGN (basic idea):

Tables:
- `vehicles`: id, make, model, year, engine
- `quotes`: id, vehicle_id, date, total_price
- `quote_items`: id, quote_id, service_id, price
- `services`: id, name, category
- `prices`: id, service_id, price, supplier_id, date
- `suppliers`: id, name, contact_info

Use an ORM like Prisma (Node.js/TypeScript) or Sequelize.

---

### 🧱 TECH STACK:

Frontend:
- React + TypeScript
- Tailwind CSS or Bootstrap
- Axios for API calls

Backend:
- Node.js (Express or Next.js API routes)
- TypeScript
- Prisma ORM (preferred) or Sequelize
- PostgreSQL (can use SQLite for dev)

PDF Export:
- Use `jsPDF` or `html2pdf.js`

---

### 🐳 Docker Hosting:

Dockerfile must:
- Build frontend
- Serve with Nginx
- Start Node.js API backend
- Connect to database (Postgres or SQLite)
- Use multi-stage build for optimization

Expose port `80`.

---

### 📄 FILE STRUCTURE SUGGESTION:

