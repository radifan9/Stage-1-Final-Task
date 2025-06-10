import app from "./app.js";

// ===============================================
// SERVER START
// ===============================================
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});
