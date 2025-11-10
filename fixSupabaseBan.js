import fetch from "node-fetch";

const PROJECT_REF = "jvyojsfifpuryayqvuke"; // <-- tu ID de Supabase
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/network-restrictions`;
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2eW9qc2ZpZnB1cnlheXF2dWtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcxMDIyMywiZXhwIjoyMDc4Mjg2MjIzfQ.3gT8lfIQNICok84sFeioONRVcuUN6rWkqyFLx2qGgmU"; // <-- clave de servicio (service_role) de tu proyecto
const TARGET_IP = "18.223.74.85/32";

async function checkAndFixBan() {
  try {
    // Obtener restricciones actuales
    const res = await fetch(API_URL, {
      headers: { "Authorization": `Bearer ${TOKEN}` }
    });
    const data = await res.json();

    // 1️⃣ Buscar si está baneada
    const banned = data.bans?.find(ip => ip.address === TARGET_IP);
    if (banned) {
      console.log(`🚫 IP ${TARGET_IP} está en Network Ban. Eliminando...`);
      await fetch(`${API_URL}/bans/${banned.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${TOKEN}` }
      });
      console.log("✅ Eliminada de Network Ban.");
    } else {
      console.log(`🟢 IP ${TARGET_IP} no está baneada.`);
    }

    // 2️⃣ Comprobar si está en Allow
    const allowed = data.allow?.find(ip => ip.address === TARGET_IP);
    if (!allowed) {
      console.log(`➕ Agregando ${TARGET_IP} a Allow list...`);
      await fetch(`${API_URL}/allow`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ address: TARGET_IP })
      });
      console.log("✅ Añadida a Allow Access.");
    } else {
      console.log(`✅ IP ${TARGET_IP} ya está en Allow list.`);
    }

  } catch (err) {
    console.error("❌ Error al comprobar Supabase:", err.message);
  }
}

// Ejecutar una vez
checkAndFixBan();

// Opción: repetir cada 10 minutos
setInterval(checkAndFixBan, 10 * 60 * 1000);
