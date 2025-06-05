function confirmLogout(event) {
  event.preventDefault();
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (confirmLogout) {
    window.location.href = "/logout";
  }
  return false;
}
