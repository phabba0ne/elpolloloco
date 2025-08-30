(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    scripts.forEach((tag) => {
      const url = tag.getAttribute("src");
      fetch(url, { method: "HEAD" })
        .then((res) => {
          if (!res.ok) {
            console.error(
              `[ScriptDebug] ❌ Script nicht gefunden oder Fehler: ${url} (Status ${res.status})`
            );
          } else {
            console.log(`[ScriptDebug] ✅ Script geladen: ${url}`);
          }
        })
        .catch((err) => {
          console.error(`[ScriptDebug] ⚠️ Netzwerkfehler bei ${url}`, err);
        });
    });
  });
})();