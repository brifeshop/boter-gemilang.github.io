document.addEventListener("DOMContentLoaded", () => {
    // Memuat komponen modular
    loadComponent("header-container", "components/header.html", () => {
        highlightActiveNav();
    });
    loadComponent("footer-container", "components/footer.html");

    // Inisialisasi publikasi jika ada elemen penampungnya
    initPublications();
});

function loadComponent(containerId, filePath, callback) {
    fetch(filePath)
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.text();
        })
        .then((html) => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = html;
                if (callback) callback();
            }
        })
        .catch((err) => console.error(`Gagal memuat ${filePath}:`, err));
}

function highlightActiveNav() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function initPublications() {
    const publicationList = document.getElementById("publication-list");
    if (!publicationList) return;

    if (typeof publicationsData !== "undefined" && Array.isArray(publicationsData)) {
        renderPublicationsList(publicationsData, publicationList);
        setupPublicationFilters(publicationsData, publicationList);
        
        const countElement = document.querySelector("[data-publication-count]");
        if (countElement) countElement.textContent = `${publicationsData.length} Publikasi`;
    } else {
        publicationList.innerHTML = `<div class="alert alert-warning mb-0">Daftar publikasi belum dapat dimuat. Pastikan file publications-data.js sudah terhubung.</div>`;
    }
}

function setupPublicationFilters(publications, container) {
    const searchInput = document.getElementById("searchPublication");
    const filterRole = document.getElementById("filterRole");
    const filterScope = document.getElementById("filterScope");
    const countElement = document.querySelector("[data-publication-count]");

    function applyFilters() {
        const keyword = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const role = filterRole ? filterRole.value : "all";
        const scope = filterScope ? filterScope.value : "all";

        const filtered = publications.filter((pub) => {
            const searchableText = [pub.title, pub.authors, pub.journal]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            const matchKeyword = searchableText.includes(keyword);

            const matchRole = (role === "all") || (pub.role === role);
            const matchScope = (scope === "all") || (pub.type === scope);

            return matchKeyword && matchRole && matchScope;
        });

        renderPublicationsList(filtered, container);
        if (countElement) countElement.textContent = `${filtered.length} Publikasi`;
    }

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (filterRole) filterRole.addEventListener("change", applyFilters);
    if (filterScope) filterScope.addEventListener("change", applyFilters);
}

function renderPublicationsList(publications, container) {
    if (!publications.length) {
        container.innerHTML = `<div class="text-center text-muted py-4">Belum ada publikasi yang sesuai dengan filter atau kata kunci tersebut.</div>`;
        return;
    }

    container.innerHTML = publications.map((publication) => {
        const cleanDoi = publication.doi ? publication.doi.replace(/^https?:\/\/doi\.org\//, '') : '';
        const publicationUrl = cleanDoi
            ? `https://doi.org/${cleanDoi}`
            : `https://scholar.google.com/scholar?q=${encodeURIComponent(publication.title)}`;

        const citationId = `${publication.id}-apa`;
        const bibtexId = `${publication.id}-bibtex`;

        const typeLabel = publication.role === "first-author" ? "First Author" : "Co-Author";
        const scopeLabel = publication.type === "international" ? "Jurnal Internasional" : "Jurnal Nasional";

        const highlightedAuthors = publication.authors.replace(
            /Gemilang Rahmadara/g,
            "<strong>Gemilang Rahmadara</strong>"
        );

        const journalDetails = [
            publication.journal,
            publication.volume && publication.volume !== "-" ? `Vol. ${publication.volume}` : null
        ].filter(Boolean).join(", ");

        return `<article class="card card-custom p-4 border-0 shadow-sm mb-3">
            <div class="d-flex flex-wrap gap-2 mb-2">
                <span class="badge bg-primary">${typeLabel}</span>
                <span class="badge bg-success-subtle text-success border border-success-subtle">${scopeLabel}</span>
                <span class="badge bg-light text-dark border">${publication.year}</span>
            </div>
            <h4 class="h5 fw-bold text-dark mb-2">${publication.title}</h4>
            <p class="text-muted small mb-1">${highlightedAuthors}</p>
            <p class="text-secondary small mb-0"><em>${journalDetails}</em></p>
            <div class="pt-3 mt-3 border-top d-flex flex-wrap align-items-center gap-2">
                <button class="btn btn-sm btn-primary rounded-2" type="button" onclick="copyCitation('${citationId}')">
                    <i class="bi bi-quote me-1"></i> Salin APA
                </button>
                <button class="btn btn-sm btn-outline-secondary rounded-2" type="button" onclick="copyCitation('${bibtexId}')">
                    <i class="bi bi-code-square me-1"></i> Salin BibTeX
                </button>
                <a href="${publicationUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-dark rounded-2">
                    <i class="bi bi-search me-1"></i> ${cleanDoi ? "Buka DOI" : "Cari Artikel"}
                </a>
            </div>
            <div id="${citationId}" class="d-none">${publication.citationApa || ""}</div>
            <div id="${bibtexId}" class="d-none">${publication.citationBibtex || ""}</div>
        </article>`;
    }).join("");
}

function renderPublications(publications, container) {
    renderPublicationsList(publications, container);
}

function copyCitation(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const textToCopy = element.innerText || element.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Kutipan berhasil disalin ke clipboard!");
    }).catch((err) => {
        console.error("Gagal menyalin kutipan:", err);
    });
}