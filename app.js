// 1. Import statements
import express from "express";
import { Pool } from "pg";
import hbs from "hbs";
import path from "path";
import TECH_STACKS from "./src/data/techstacks.js";
import COMPANIES_LOGO from "./src/data/companyLogo.js";
import PROJECT_IMAGE from "./src/data/projectDemo.js";

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
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;

// 4. Middleware Setup & static files
app.set("view engine", "hbs");
app.set("views", "src/views");
app.use("/assets", express.static("src/assets"));
app.use("/swiper", express.static("node_modules/swiper"));
hbs.registerPartials(path.join(__dirname, "src/views/partials"));

// 5. Utility functions
// Get techStacks title and img from contant TECH_STACKS
function getTechStacks(techStacksDB) {
  const techStacksAndImg = techStacksDB.map((techStackDB) => {
    const { title, img } = TECH_STACKS.find(
      (TECH) => TECH.title === techStackDB.title
    );
    return { title, img };
  });

  return techStacksAndImg;
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
    // If "undefined" dateFormatter will output Jan 1970
    const formattedEnd =
      dateFormatter.format(end) === "Jan 1970"
        ? "Present"
        : dateFormatter.format(end);

    // Replace company (just `name`) from COMPANIES_LOGO (`name` and `img`)
    const companyNameAndImg = COMPANIES_LOGO.find(
      (COMPANY) => COMPANY.name === workExperience.company
    );

    return {
      role: workExperience.role,
      start: formattedStart,
      end: formattedEnd,
      company: companyNameAndImg,
      responsibilities: workExperience.responsibilities,
      techUsed: workExperience.tech_used,
    };
  });

  return formattedWorkExperiences;
}

function formatProjects(projectsDB) {
  const formattedProjects = projectsDB.map((project) => {
    const titleAndImg = PROJECT_IMAGE.find(
      (PROJECT) => PROJECT.title === project.title
    );

    return {
      title: project.title,
      img: titleAndImg
        ? titleAndImg.img
        : `https://picsum.photos/seed/${project.id}/400/200`,
      description: project.description,
      techUsed: project.tech_used,
      githubRepo: project.github_repo,
      liveDemo: project.live_demo,
    };
  });

  return formattedProjects;
}

// 6. Route handlers
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

    // Query projects
    const { rows: projectsDB } = await db.query("SELECT * FROM projects");
    const formattedProjects = formatProjects(projectsDB);

    res.render("index", {
      techStacks,
      workExperiences: formattedWorkExperiences,
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("Error getting the data from database:", error);
    res.status(500).send("Error getting the data from database");
  }
};

// 7. Routes
app.route("/").get(renderIndex);

// 8. Server start
app.listen(CONFIG.nodePort, () => {
  console.log(`Server running on http://127.0.0.1:${CONFIG.nodePort}`);
});
