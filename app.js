// ===============================================
// IMPORTS
// ===============================================
import express from "express";
import { Pool } from "pg";
import hbs from "hbs";
import path from "path";
import bcrypt from "bcrypt";
import flash from "express-flash";
import session from "express-session";
import morgan from "morgan";
import multer from "multer";
import moment from "moment";

// Data imports, legacy
import TECH_STACKS from "./src/data/techstacks.js";
import COMPANIES_LOGO from "./src/data/companyLogo.js";
import PROJECT_IMAGE from "./src/data/projectDemo.js";

// ===============================================
// CONFIGURATION & CONSTANTS
// ===============================================
const CONFIG = {
  nodePort: 3002,
  database: {
    user: "postgres",
    password: "ms11drag00nsql",
    host: "localhost",
    port: 5432,
    database: "b61-final-portfolio",
  },
};

// Maps route segments to database table names for dynamic CRUD operations
const tableMap = {
  // route: table name
  techstacks: "tech_stacks",
  experiences: "work_experiences",
  projects: "projects",
};

// ===============================================
// APP SETUP & INITIALIZATION
// ===============================================
const app = express();
const db = new Pool(CONFIG.database);
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;

// ===============================================
// HANDLEBARS HELPERS
// ===============================================
// Equality comparison, return true if equal, used in path compare
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});

// Date format in input
hbs.registerHelper("formatDate", function (datestring, format) {
  return moment(datestring).format(format);
});

// ===============================================
// UTILITY FUNCTIONS
// ===============================================
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
    // const companyNameAndImg = COMPANIES_LOGO.find(
    //   (COMPANY) => COMPANY.name === workExperience.company
    // );

    return {
      id: workExperience.id,
      role: workExperience.role,
      start: formattedStart,
      end: formattedEnd,
      company: workExperience.company,
      responsibilities: workExperience.responsibilities,
      techUsed: workExperience.tech_used,
      img: workExperience.img,
    };
  });

  return formattedWorkExperiences;
}

function formatProjects(projectsDB) {
  const formattedProjects = projectsDB.map((project) => {
    // const titleAndImg = PROJECT_IMAGE.find(
    //   (PROJECT) => PROJECT.title === project.title
    // );

    console.log(project);

    // If titleAndImg is undefined, replace it with random image
    // const img = titleAndImg
    //   ? titleAndImg.img
    //   : `https://picsum.photos/seed/${project.id}/400/200`;

    return {
      id: project.id,
      title: project.title,
      img: project.img,
      description: project.description,
      techUsed: project.tech_used,
      githubRepo: project.github_repo,
      liveDemo: project.live_demo,
    };
  });

  return formattedProjects;
}

// ===============================================
// MIDDLEWARE SETUP
// ===============================================
// Basic Express configuration
app.set("view engine", "hbs");
app.set("views", "src/views");
app.use("/assets", express.static("src/assets")); // Server static files
app.use("/swiper", express.static("node_modules/swiper"));
app.use(express.urlencoded({ extended: false })); // Parse form data

// Session configuration for user authentication
app.use(
  session({
    secret: "ruby-chan",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // true = sent cookie over https
      maxAge: 1000 * 60 * 60, // session expires after 1 hour
    },
  })
);
app.use(flash()); // Flash messages for user feedback

// Global middleware to make user session data available in all templates
// through res.locals
app.use((req, res, next) => {
  res.locals.userData = {
    name: req.session.user?.name,
    email: req.session.user?.email,
  };
  next();
});

app.use(morgan("dev")); // HTTP request logging
hbs.registerPartials(path.join(__dirname, "src/views/partials")); // Register partial templates

// File upload configuration using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/assets/uploads"); // Upload directory
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// ===============================================
// CUSTOM MIDDLEWARE
// ===============================================
// Authentication middleware - protects routes that require login
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    // User is authenticated, proceed
    return next();
  } else {
    // User is not authenticated
    req.flash("error", "⚠️ Please log in to access dashboard");
    return res.redirect("/login");
  }
};

// Middleware for preparing ADD operations - extracts data and builds SQL query
const prepareAddTechStacks = (req, res, next) => {
  const { title } = req.body;

  // Get table name dynamically from route
  // Example req.path "/dashboard/techstacks
  const routeKey = req.path.split("/")[2];
  const tableName = tableMap[routeKey];

  const query = {
    text: `INSERT INTO public.${tableName} (title, img) VALUES ($1, $2)`,
    values: [title, req.file.filename],
  };

  // Attach data to request object for next middleware
  req.addQuery = query;
  req.title = title;
  req.tableName = tableName;
  next();
};

const prepareAddExperiences = (req, res, next) => {
  const { role, company, startDate, endDate, responsibilities, techUsed } =
    req.body;

  // Convert empty strings to Jan 1970 (standard for a lot of date lib)
  const formattedEndDate = endDate === "" ? "1970-01-01" : endDate;

  // Get table name dynamically from route
  // Example req.path "/dashboard/techstacks
  const routeKey = req.path.split("/")[2];
  const tableName = tableMap[routeKey];

  const query = {
    text: `INSERT INTO public.${tableName} (role, company, start_date, end_date, responsibilities, tech_used, img) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    values: [
      role,
      company,
      startDate,
      formattedEndDate,
      responsibilities,
      techUsed,
      req.file.filename,
    ],
  };

  // Attach data to request object for next middleware
  req.addQuery = query;
  req.title = role;
  req.tableName = tableName;
  next();
};

const prepareAddProjects = (req, res, next) => {
  const { title, description, techUsed, githubRepo, liveDemo } = req.body;

  // Get table name dynamically from route
  // Example req.path "/dashboard/techstacks/20/Kotlin"
  const routeKey = req.path.split("/")[2]; // Gets 'techstacks'
  const tableName = tableMap[routeKey];

  const query = {
    text: `
      INSERT INTO public.${tableName} 
        (title, description, tech_used, github_repo, live_demo, img)
      VALUES 
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    values: [
      title,
      description,
      techUsed,
      githubRepo,
      liveDemo,
      req.file.filename,
    ],
  };

  // Attach data to request object for next middleware
  req.addQuery = query;
  req.title = title;
  req.tableName = tableName;
  next();
};

// Middleware for preparing UPDATE operations - handles existing vs new images
const prepareUpdateTechStacks = (req, res, next) => {
  const { id } = req.params;
  const { title, description, techUsed, githubRepo, liveDemo, existingImage } =
    req.body; // exisstingImg from hidden input
  const img = req.file ? req.file.filename : existingImage;

  // Get table name dynamically from route
  // Example req.path "/dashboard/techstacks/20/Kotlin"
  const routeKey = req.path.split("/")[2]; // Gets 'techstacks'
  const tableName = tableMap[routeKey];

  const query = {
    text: `UPDATE public.${tableName} SET title = $1, img = $2 WHERE id = $3`,
    values: [title, img, id],
  };

  // Attach data to request object for next middleware
  req.updateQuery = query;
  req.title = title;
  req.tableName = tableName;
  next();
};

const prepareUpdateExperiences = (req, res, next) => {
  const { id } = req.params;
  const {
    role,
    company,
    startDate,
    endDate,
    responsibilities,
    techUsed,
    existingImage,
  } = req.body; // exisstingImg from hidden input
  const img = req.file ? req.file.filename : existingImage;

  // Get table name dynamically from route
  // Example req.path "/dashboard/techstacks/20/Kotlin"
  const routeKey = req.path.split("/")[2]; // Gets 'techstacks'
  const tableName = tableMap[routeKey];

  const query = {
    text: `UPDATE public.${tableName} SET role = $1, img = $2, company = $3, start_date = $4, end_date = $5, responsibilities = $6, tech_used = $7 WHERE id = $8`,
    values: [
      role,
      img,
      company,
      startDate,
      endDate,
      responsibilities,
      techUsed,
      id,
    ],
  };

  // Attach data to request object for next middleware
  req.updateQuery = query;
  req.title = role;
  req.tableName = tableName;
  next();
};

const prepareUpdateProjects = (req, res, next) => {
  const { id } = req.params;
  const { title, description, techUsed, githubRepo, liveDemo, existingImage } =
    req.body; // exisstingImg from hidden input
  const img = req.file ? req.file.filename : existingImage;

  // Get table name dynamically from route
  // Example req.path "/dashboard/techstacks/20/Kotlin"
  const routeKey = req.path.split("/")[2]; // Gets 'techstacks'
  const tableName = tableMap[routeKey];

  const query = {
    text: `UPDATE public.${tableName} 
           SET title = $1, 
               description = $2, 
               tech_used = $3, 
               github_repo = $4, 
               live_demo = $5, 
               img = $6 
           WHERE id = $7`,
    values: [title, description, techUsed, githubRepo, liveDemo, img, id],
  };

  // Attach data to request object for next middleware
  req.updateQuery = query;
  req.title = title;
  req.tableName = tableName;
  next();
};

// ===============================================
// ROUTE HANDLERS
// ===============================================

// --- PUBLIC ROUTES ---
const renderIndex = async (req, res) => {
  try {
    // Query techStacks
    const { rows: techStacksDB } = await db.query("SELECT * FROM tech_stacks");
    // const techStacks = getTechStacks(techStacksDB);

    // Query workExperience
    const { rows: workExperiences } = await db.query(
      "SELECT * FROM work_experiences"
    );
    const formattedWorkExperiences = formatWorkExperiences(workExperiences);

    // Query projects
    const { rows: projectsDB } = await db.query("SELECT * FROM projects");
    const formattedProjects = formatProjects(projectsDB);

    res.render("index", {
      techStacks: techStacksDB,
      experiences: formattedWorkExperiences,
      projects: formattedProjects,
      path: "/",
    });
  } catch (error) {
    console.error("Error getting the data from database:", error);
    res.status(500).send("Error getting the data from database");
  }
};

// --- AUTHENTICATION HANDLERS ---
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
    req.flash("error", "⚠️ An error occurred during registration");
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

const logout = (req, res) => {
  req.session.destroy();
  res.redirect("/");
};

// --- DASHBOARD HANDLERS ---
const renderDashboard = async (req, res) => {
  try {
    const { rows: techStacksDB } = await db.query(
      "SELECT * FROM tech_stacks ORDER BY id ASC"
    );

    const { rows: experiencesDB } = await db.query(
      "SELECT * FROM public.work_experiences ORDER BY id ASC"
    );

    const experiences = formatWorkExperiences(experiencesDB);

    const { rows: projectsDB } = await db.query(
      "SELECT * FROM public.projects ORDER BY id ASC"
    );

    const formattedProjects = formatProjects(projectsDB);

    res.render("dashboard", {
      title: "dashboard",
      path: "/dashboard",
      techStacksDB,
      experiences,
      projects: formattedProjects,
      message: {
        success: req.flash("success"),
        error: req.flash("error"),
      },
    });
  } catch (error) {
    console.log(error);
  }
};

// --- CRUD HANDLERS ---

// Create or add handlers
const renderTechStacks = (req, res) => {
  res.render("addEditTechStacks", {
    title: "Add Tech Stacks",
    path: "/dashboard",
  });
};

const renderExperiences = (req, res) => {
  res.render("addEditExperiences", {
    title: "Add Edit Work Experiences",
  });
};

const renderProjects = (req, res) => {
  res.render("addEditProjects", {
    title: "Add Projects",
  });
};

const handleAdd = async (req, res) => {
  // Get all the data from prepareAdd
  const title = req.title;
  const tableName = req.tableName;
  const addQuery = req.addQuery;

  await db.query(addQuery);

  req.flash("success", `✅ ${title} has been added to ${tableName}`);
  res.redirect("/dashboard");
};

// Read/Edit handlers
const renderEditTechStacks = async (req, res) => {
  const id = parseInt(req.params.id);

  // Example req.path "/dashboard/techstacks
  const routeKey = req.path.split("/")[2];
  const tableName = tableMap[routeKey];

  const { rows: techStackDB } = await db.query({
    text: `SELECT * FROM public.${tableName} WHERE id = $1`,
    values: [id],
  });

  res.render("addEditTechStacks", {
    title: "Edit Tech Stacks",
    path: "/dashboard",
    techStack: techStackDB.at(0),
  });
};

const renderEditExperiences = async (req, res) => {
  const id = parseInt(req.params.id);

  // Example req.path "/dashboard/techstacks
  const routeKey = req.path.split("/")[2];
  const tableName = tableMap[routeKey];

  const { rows: experienceDB } = await db.query({
    text: `SELECT * FROM public.${tableName} WHERE id = $1`,
    values: [id],
  });

  res.render("addEditExperiences", {
    title: "Edit Work Experiences",
    path: "/dashboard",
    experience: experienceDB.at(0),
  });
};

const renderEditProjects = async (req, res) => {
  const id = parseInt(req.params.id);

  // Example req.path "/dashboard/techstacks
  const routeKey = req.path.split("/")[2];
  const tableName = tableMap[routeKey];

  const { rows: projectDB } = await db.query({
    text: `SELECT * FROM public.${tableName} WHERE id = $1`,
    values: [id],
  });

  const formattedProject = formatProjects(projectDB);

  res.render("addEditProjects", {
    project: formattedProject.at(0),
  });
};

const handleEdit = async (req, res) => {
  try {
    // Get all the data from prepareUpdate
    const title = req.title;
    const tableName = req.tableName;
    const updateQuery = req.updateQuery;

    await db.query(updateQuery);

    req.flash("success", `✅ ${title} has been updated in ${tableName}`);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(`Error updating in ${tableName}: ${error}`);
    res.redirect("/dashboard");
  }
};

// Delete handlers
const handleDelete = async (req, res) => {
  try {
    const { id, title } = req.params;

    // Example req.path "/dashboard/techstacks/20/Kotlin"
    const routeKey = req.path.split("/")[2]; // Gets 'techstacks'
    const tableName = tableMap[routeKey];

    await db.query({
      text: `DELETE FROM public.${tableName} WHERE id = $1`,
      values: [id],
    });

    req.flash("success", `✅ ${title} has been deleted from ${tableName}`);
    res.status(200).send();
  } catch (error) {
    console.log(`Error deleting from ${tableName}: ${error}`);
    res.status(500).send();
  }
};

// ===============================================
// ROUTES, Only dashboard is protected by requireAuth
// ===============================================
// Public routes - accessible to everyone
app.route("/").get(renderIndex);

// Authentication routes - for user registration and login
app.route("/register").get(renderRegister).post(handleRegister);
app.route("/login").get(renderLogin).post(handleLogin);
app.route("/logout").get(logout);

// Dashboard routes - protected routes for admin
app.route("/dashboard/").get(renderDashboard);

// =========== CRUD ROUTES ===========
// Tech Stacks
app
  .route("/dashboard/techstacks")
  .get(renderTechStacks)
  .post(upload.single("img"), prepareAddTechStacks, handleAdd);
app
  .route("/dashboard/techstacks/:id{/:title}")
  .get(renderEditTechStacks)
  .post(upload.single("img"), prepareUpdateTechStacks, handleEdit)
  .delete(handleDelete);

// Experiences
app
  .route("/dashboard/experiences")
  .get(renderExperiences)
  .post(upload.single("img"), prepareAddExperiences, handleAdd);

app
  .route("/dashboard/experiences/:id{/:title}")
  .get(renderEditExperiences)
  .post(upload.single("img"), prepareUpdateExperiences, handleEdit)
  .delete(handleDelete);

// PROJECT add & delete not implemented
app
  .route("/dashboard/projects")
  .get(renderProjects)
  .post(upload.single("img"), prepareAddProjects, handleAdd);

app
  .route("/dashboard/projects/:id{/:title}")
  .get(renderEditProjects)
  .post(upload.single("img"), prepareUpdateProjects, handleEdit)
  .delete(handleDelete);

// Note: requireAuth middleware is currently disabled for easier development
// Add requireAuth to dashboard routes in production

// ===============================================
// SERVER START
// ===============================================
app.listen(CONFIG.nodePort, () => {
  console.log(`Server running on http://127.0.0.1:${CONFIG.nodePort}`);
});
