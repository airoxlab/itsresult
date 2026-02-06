import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";

// Load environment variables
const supabaseUrl = 'https://yejfxrumrsnnteeolntg.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllamZ4cnVtcnNubnRlZW9sbnRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MjIzMTEsImV4cCI6MjA3NjM5ODMxMX0.hwKyf77IV3MfQICcrPmEyVjzIIqNWYxdaGOfwlSJKmU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function uploadStudents() {
  try {
    // Read Excel file
    const workbook = XLSX.readFile("./hamza.xlsx");
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const records = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${records.length} records in Excel file`);

    // Prepare data for insertion
    const students = [];
    let skipped = 0;

    for (const record of records) {
      // Try different column name formats
      const rollNumber = record["Roll No."] || record["__EMPTY_1"];
      const name = record["Student Name"] || record["__EMPTY_2"];
      const fatherName = record["Father Name"] || record["__EMPTY_3"];
      const obtainedMarks = record["Zero Test Marks"] || record["__EMPTY_4"];

      // Skip rows with missing essential data
      if (!name || !fatherName || !rollNumber) {
        skipped++;
        continue;
      }

      // Parse marks, default to 0 if empty
      const marks = obtainedMarks != null && obtainedMarks !== ""
        ? (typeof obtainedMarks === 'number' ? obtainedMarks : parseInt(obtainedMarks))
        : 0;

      students.push({
        name: String(name).trim(),
        father_name: String(fatherName).trim(),
        roll_number: String(rollNumber).trim(),
        total_marks: 100,
        obtained_marks: marks,
      });
    }

    console.log(`Prepared ${students.length} students for upload (skipped ${skipped} empty rows)`);

    // Insert data in batches
    const batchSize = 50;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from("students")
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error.message);
        errors += batch.length;
      } else {
        inserted += data.length;
        console.log(`Inserted batch ${i / batchSize + 1}: ${data.length} students`);
      }
    }

    console.log("\n=== Upload Summary ===");
    console.log(`Total records in CSV: ${records.length}`);
    console.log(`Skipped (empty rows): ${skipped}`);
    console.log(`Successfully inserted: ${inserted}`);
    console.log(`Failed: ${errors}`);

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

uploadStudents();
