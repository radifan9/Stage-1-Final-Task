// 1. Import statements
import express from "express";
import { Pool } from "pg";
import hbs from "hbs";
import path from "path";
import TECH_STACKS from "./src/data/techstacks.js";
import COMPANIES_LOGO from "./src/data/companyLogo.js";
import PROJECT_IMAGE from "./src/data/projectDemo.js";
import bcrypt from "bcrypt";
import flash from "express-flash";
import session from "express-session";

// 2. Constants and Configuration
const CONFIG = {
  nodePort: 3001,
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
app.use(express.urlencoded({ extended: false })); // Parses form data
app.use(
  session({
    secret: "ruby-chan",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // true = https
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);
app.use(flash());
// Add session to middleware, so we don't have to pass userData to every route
app.use((req, res, next) => {
  res.locals.userData = {
    name: req.session.user?.name,
    email: req.session.user?.email,
  };
  next();
});

// Create authentication middleware
const requireAuth = (req, res, next) => {
  console.log(`--- authentication`);
  console.log(`--- req.session.user: ${req.session.user}`);
  if (req.session.user) {
    // User is authenticated, proceed
    return next();
  } else {
    // User is not authenticated
    req.flash("error", "⚠️ Please log in to access dashboard");
    return res.redirect("/login");
  }
};

hbs.registerPartials(path.join(__dirname, "src/views/partials"));

// --------- hbs helper
// Equality comparison, return true if equal
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});

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

    // If titleAndImg is undefined, replace it with random image
    const img = titleAndImg
      ? titleAndImg.img
      : `https://picsum.photos/seed/${project.id}/400/200`;

    return {
      title: project.title,
      img: img,
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

const renderRegister = (req, res) => {
  res.render("register", {
    title: "Register",
    message: {
      error: req.flash("error"),
    },
  });
};

const handleRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const { rows: isRegistered } = await db.query({
      text: "SELECT email FROM public.users WHERE email=$1",
      values: [email],
    });
    if (isRegistered.length > 0) {
      req.flash("error", "⚠️ Email already registered");
      return res.redirect("/register");
    }

    // Hash password & create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query({
      text: "INSERT INTO public.users (name, email, password) VALUES ($1, $2, $3)",
      values: [name, email, hashedPassword],
    });
    req.flash("success", "✅ Registration successful! Please login.");
    res.redirect("/login");
  } catch (error) {
    console.log("Registration error:", error);
    // req.flash("error", "⚠️ An error occurred during registration");
    res.redirect("/register");
  }
};

const renderLogin = (req, res) => {
  res.render("login", {
    title: "Login",
    message: {
      success: req.flash("success"),
      error: req.flash("error"),
    },
  });
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows: isRegistered } = await db.query({
      text: "SELECT * FROM public.users WHERE email = $1",
      values: [email],
    });

    console.log({ email, password });
    console.log(`Hashed password: ${isRegistered.at(0).password}`);

    // console.log({ isRegistered });
    if (!isRegistered.at(0)) {
      req.flash("error", "⚠️ User not found");
      return res.redirect("/login");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, isRegistered.at(0).password);
    if (!isMatch) {
      // If password isn't match
      req.flash("error", "⚠️ Incorrect password");
      return res.redirect("/login");
    }

    // Set session and redirect
    req.session.user = {
      name: isRegistered.at(0).name,
      email: isRegistered.at(0).email,
    };
    res.redirect("/dashboard");
  } catch (error) {
    console.log("Login error:", error);
    req.flash("error", "⚠️ An error occurred during login");
    res.redirect("/login");
  }
};

const renderDashboard = (req, res) => {
  res.render("dashboard", {
    title: "dashboard",
    path: "/dashboard",
  });
};

// 7. Routes
app.route("/").get(renderIndex);
app.route("/register").get(renderRegister).post(handleRegister);
app.route("/login").get(renderLogin).post(handleLogin);
app.route("/dashboard").get(requireAuth, renderDashboard);

// 8. Server start
app.listen(CONFIG.nodePort, () => {
  console.log(`Server running on http://127.0.0.1:${CONFIG.nodePort}`);
});
