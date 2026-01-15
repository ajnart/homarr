import { db } from "..";
import { seedDataAsync } from "./seed";

seedDataAsync(db)
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((err) => {
    console.log("Seed failed\n\t", err);
    process.exit(1);
  });
