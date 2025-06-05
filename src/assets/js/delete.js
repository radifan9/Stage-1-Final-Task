// We can use this function to delete data from every table
// Must use element attribute: data-table="table" data-title= "title of data"
async function confirmDelete(event) {
  event.preventDefault();

  // Get table and title of element
  const tableName = event.submitter.dataset.table;
  const title = event.submitter.dataset.name;

  console.log("--- DELETE JS");
  console.log(tableName);
  console.log(title);

  // Confirmation dialog
  if (confirm(`Are you sure you want to delete "${title}"?`)) {
    const id = event.target.elements.id.value;

    try {
      console.log(`/dashboard/${tableName}/${id}`);
      const response = await fetch(`/dashboard/${tableName}/${id}/${title}`, {
        method: "DELETE",
      });
      // Handles success HTTP conn (200-299)
      if (response.ok) {
        // Redirect
        console.log("--- Deleted");
        window.location.href = "/dashboard";
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      // Catches network errors, etc
      console.error("Error:", error);
      alert("Error deleting specified data");
    }
  }
}
