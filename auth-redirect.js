// Identity email links can arrive at the site's default homepage.
// Keep authentication tokens in the URL fragment and hand off to the workspace.
(() => {
  const params = new URLSearchParams(location.hash.slice(1));
  if (['invite_token', 'recovery_token', 'confirmation_token', 'email_change_token', 'access_token'].some(key => params.has(key))) {
    location.replace('/workspace.html' + location.hash);
  }
})();
