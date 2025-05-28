// 1. Import statements
import express from "express";
import { Pool } from "pg";
import hbs from "hbs";
import path from "path";
import { fileURLToPath } from "url";
import Swiper from "swiper/bundle";
import { title } from "process";
import TECH_STACKS from "./src/data/techstacks.js";

// 2. Constants and Configuration
const CONFIG = {
  nodePort: 3000,
  database: {
    user: "postgres",
    password: "ms11drag00nsql",
    host: "localhost",
    port: 5432,
    database: "b61-final-portfolio",
  },
};

// 3. App setup
const app = express();
const db = new Pool(CONFIG.database);

// 4. Middleware Setup
app.set("view engine", "hbs");
app.set("views", "src/views");
app.use("/assets", express.static("src/assets"));

// 5. Handlebars

// 6. Utility functions
function getTechStacks(techStacksDB) {
  console.log(`--- Masuk getTechStacks`);
  return TECH_STACKS.reduce((acc, currTech) => {
    const dbTech = techStacksDB.find(
      // If tech in database ===  current TECH constant, return that element otherwise undefined
      (dbTech) => dbTech.title === currTech.title
    );
    console.log(dbTech);
    if (dbTech) {
      acc[currTech.title] = { ...dbTech, imgSrc: currTech.imgSrc };
    }
    return acc;
  }, {});
}

// 7. Route handlers
const renderIndex = async (req, res) => {
  const techStacksDB = await db.query("SELECT * FROM tech_stacks");
  // console.log(techStacksDB.rows);
  const techStacks = getTechStacks(techStacksDB.rows);
  console.log(`--- techStacks`);
  console.log(techStacks);

  res.render("index", {
    techStacks,
  });
};

// 8. Routes
app.route("/").get(renderIndex);

// 9. Server start
app.listen(CONFIG.nodePort, () => {
  console.log(`Server running on http://127.0.0.1:${CONFIG.nodePort}`);
});
