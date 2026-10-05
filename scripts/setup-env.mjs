import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
const path = new URL("../apps/backend/.env", import.meta.url);
if (existsSync(path)) {
  console.log("El entorno del backend ya existe. Se conserva su configuración.");
} else {
  const secret = () => randomBytes(32).toString("hex");
  writeFileSync(path, `HOST=127.0.0.1\nPORT=1337\nAPP_KEYS=${secret()},${secret()}\n${["API_TOKEN_SALT", "ADMIN_JWT_SECRET", "TRANSFER_TOKEN_SALT", "JWT_SECRET", "ENCRYPTION_KEY"].map(key => `${key}=${secret()}`).join("\n")}\nDATABASE_CLIENT=sqlite\nDATABASE_FILENAME=.tmp/data.db\n`, { mode: 0o600 });
  console.log("Entorno local creado. Ejecutá npm run dev.");
}
