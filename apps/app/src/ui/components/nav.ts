export function nav(active: string): string {
  const links = [
    { href: "/", label: "Dashboard", id: "dashboard" },
    { href: "/posts", label: "Posts", id: "posts" },
    { href: "/media", label: "Media", id: "media" },
    { href: "/accounts", label: "Accounts", id: "accounts" },
    { href: "/jobs", label: "Jobs", id: "jobs" }
  ];

  return `
    <nav class="side-nav" aria-label="Postmerce sections">
      <a class="product-mark" href="/">Postmerce</a>
      <div class="nav-links">
        ${links
          .map((link) => {
            const current = link.id === active ? "aria-current=\"page\"" : "";
            return `<a href="${link.href}" ${current}>${link.label}</a>`;
          })
          .join("")}
      </div>
    </nav>
  `;
}
