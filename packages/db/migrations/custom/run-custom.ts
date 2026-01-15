import { applyCustomMigrationsAsync } from ".";
import { db } from "../..";

applyCustomMigrationsAsync(db)
  .then(() => {
    console.log("Custom migrations applied successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.log("Failed to apply custom migrations\n\t", err);
    process.exit(1);
  });
