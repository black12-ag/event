// Optional legacy sync helper. The main app runs on Supabase and does not require mysql2.
export interface MariaDBSyncData {
  name: string;
  message?: string;
  attendance_status?: string;
  guests?: number;
  source: "rsvp" | "wish";
  invite_slug?: string;
}

export async function syncToMariaDB(data: MariaDBSyncData) {
  const connectionString = process.env.MARIADB_URL;
  if (!connectionString) {
    console.warn("MARIADB_URL not set, skipping MariaDB sync.");
    return;
  }

  let connection;
  try {
    const mysql = await (new Function('return import("mysql2/promise")')() as Promise<any>);
    connection = await mysql.createConnection(connectionString);
    
    // Create table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS event_sync (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        message TEXT,
        attendance_status VARCHAR(50),
        guests INT DEFAULT 0,
        source VARCHAR(50),
        invite_slug VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [result] = await connection.execute(
      "INSERT INTO event_sync (name, message, attendance_status, guests, source, invite_slug) VALUES (?, ?, ?, ?, ?, ?)",
      [
        data.name,
        data.message || "",
        data.attendance_status || "pending",
        data.guests || 0,
        data.source,
        data.invite_slug || null
      ]
    );

    console.log("Synced to MariaDB successfully:", result);
  } catch (error) {
    console.error("MariaDB sync error:", error);
    // Continue even if sync fails
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
