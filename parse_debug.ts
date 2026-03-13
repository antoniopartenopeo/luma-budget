import { parseCSV } from "./src/features/import-csv/core/parse";
const csv = `Data,Importo\n2024-01-01`;
console.dir(parseCSV(csv), {depth: null});
