// 1. Import statements
import express from "express";
import { Pool } from "pg";
import hbs from "hbs";
import path from "path";
import moment from "moment";
import { fileURLToPath } from "url";
import TECH_STACKS from "./src/data/techstacks.js";
import PLACE_LOGO from "./src/data/placeLogo.js";
import { CLIENT_RENEG_LIMIT } from "tls";

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 4. Middleware Setup
app.set("view engine", "hbs");
app.set("views", "src/views");
app.use("/assets", express.static("src/assets"));
app.use("/swiper", express.static("node_modules/swiper"));
hbs.registerPartials(path.join(__dirname, "src/views/partials"));

// 5. Handlebars

// 6. Utility functions

function getTechStacks(techStacksDB) {
  return TECH_STACKS.reduce((acc, currTech) => {
    const dbTech = techStacksDB.find(
      // If tech in database ===  current TECH constant, return that element otherwise undefined
      (dbTech) => dbTech.title === currTech.title
    );
    if (dbTech) {
      acc[currTech.title] = { ...dbTech, imgSrc: currTech.imgSrc };
    }
    return acc;
  }, {});
}

function formatWorkExperiences(workExperiences) {
  const formattedWorkExperiences = workExperiences.map((workExperience) => {
    const start = new Date(workExperience.start_date);
    const end = new Date(workExperience.end_date);

    // Target output: Oct 2022
    const dateFormatter = new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "numeric",
    });

    const formattedStart = dateFormatter.format(start);
    const formattedEnd = dateFormatter.format(end);

    const logo = PLACE_LOGO.find((logo) => logo.name === workExperience.place);

    return {
      role: workExperience.role,
      start: formattedStart,
      end: formattedEnd === "Jan 1970" ? "Present" : formattedEnd,
      place: logo,
      responsibilities: workExperience.responsibilities,
      techUsed: workExperience.tech_used,
    };
  });

  return formattedWorkExperiences;
}

// 7. Route handlers
const renderIndex = async (req, res) => {
  try {
    // Query techStacks
    const { rows: techStacksDB } = await db.query("SELECT * FROM tech_stacks");
    const techStacks = getTechStacks(techStacksDB);

    // Query workExperience
    const { rows: workExperiences } = await db.query(
      "SELECT * FROM work_experiences"
    );
    const formattedWorkExperiences = formatWorkExperiences(workExperiences);

    res.render("index", {
      techStacks,
      workExperiences: formattedWorkExperiences,
    });
  } catch (error) {
    console.error("Error getting the data from database:", error);
    res.status(500).send("Error getting the data from database");
  }
};

// 8. Routes
app.route("/").get(renderIndex);

// 9. Server start
app.listen(CONFIG.nodePort, () => {
  console.log(`Server running on http://127.0.0.1:${CONFIG.nodePort}`);
});
