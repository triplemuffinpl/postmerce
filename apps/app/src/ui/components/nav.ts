export function nav(active: string): string {
  const links = [
    { 
      href: "/", 
      label: "Dashboard", 
      id: "dashboard",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>`
    },
    { 
      href: "/posts", 
      label: "Wpisy", 
      id: "posts",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>`
    },
    {
      href: "/calendar",
      label: "Kalendarz",
      id: "calendar",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 8.25h16.5M4.5 6.75h15a.75.75 0 01.75.75v12a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75v-12a.75.75 0 01.75-.75z" />
            </svg>`
    },
    {
      href: "/control",
      label: "Kontrola",
      id: "control",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 12h9.75M10.5 18h9.75M3.75 6h.008v.008H3.75V6zm0 6h.008v.008H3.75V12zm0 6h.008v.008H3.75V18z" />
            </svg>`
    },
    { 
      href: "/media", 
      label: "Media", 
      id: "media",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>`
    },
    { 
      href: "/accounts", 
      label: "Konta", 
      id: "accounts",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94-3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>`
    },
    { 
      href: "/jobs", 
      label: "Zlecenia", 
      id: "jobs",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>`
    }
  ];

  return `
    <nav class="side-nav" aria-label="Sekcje panelu Postmerce">
      <a class="product-mark" href="/">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.61 8.41m5.98 5.96a14.98 14.98 0 01-6.16 12.12A14.98 14.98 0 013.43 14.37m12.16 0a6 6 0 00-5.84-7.38" />
        </svg>
        <span>Postmerce</span>
      </a>
      
      <div class="nav-links">
        ${links
          .map((link) => {
            const current = link.id === active ? "aria-current=\"page\"" : "";
            return `<a href="${link.href}" ${current}>${link.icon}${link.label}</a>`;
          })
          .join("")}
      </div>

      <div class="nav-footer">
        <!-- Settings Drawer: Color Accent & Theme Switcher -->
        <div class="settings-drawer">
          <button class="theme-toggle-btn" onclick="toggleTheme()" aria-label="Przełącz motyw" title="Tryb ciemny / jasny">
            <!-- Sun icon -->
            <svg class="sun-icon" style="display: var(--sun-display, block); width: 18px; height: 18px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </button>
          
          <div class="color-accent-picker" title="Wybierz kolor przewodniego akcentu (White-label)">
            <span class="color-accent-dot" style="background: #7c3aed;" onclick="changeAccent(262)" title="Violet"></span>
            <span class="color-accent-dot" style="background: #6366f1;" onclick="changeAccent(220)" title="Indigo"></span>
            <span class="color-accent-dot" style="background: #10b981;" onclick="changeAccent(142)" title="Emerald"></span>
            <span class="color-accent-dot" style="background: #f43f5e;" onclick="changeAccent(340)" title="Rose"></span>
          </div>
        </div>

        <!-- User profile block -->
        <div class="user-profile">
          <div class="user-avatar" title="Zalogowany administrator">W</div>
          <div class="user-info">
            <span class="user-name">Wojtek</span>
            <span class="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Client side dynamic state handling script -->
    <script>
      function toggleTheme() {
        const docClass = document.documentElement.classList;
        if (docClass.contains('dark-theme')) {
          docClass.remove('dark-theme');
          localStorage.setItem('postmerce-theme', 'light');
        } else {
          docClass.add('dark-theme');
          localStorage.setItem('postmerce-theme', 'dark');
        }
      }
      
      function changeAccent(hue) {
        document.documentElement.style.setProperty('--primary-hue', hue);
        localStorage.setItem('postmerce-hue', hue);
      }
    </script>
  `;
}
