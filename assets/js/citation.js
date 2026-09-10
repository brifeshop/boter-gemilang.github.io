// ==========================================
// FUNGSI UTILITAS CITASI & TOAST
// ==========================================

function copyCitation(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.value || el.textContent;
    navigator.clipboard.writeText(text).then(() => showToast("Teks citasi (APA) berhasil disalin!"));
}

function copyCode(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.value || el.textContent;
    navigator.clipboard.writeText(text).then(() => showToast("Format BibTeX berhasil disalin!"));
}

function downloadBib(filename, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.value || el.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("File .bib berhasil diunduh!");
}

function showToast(message = "Berhasil disalin ke clipboard!") {
    const toastEl = document.getElementById('copyToast');
    if (toastEl) {
        const toastBody = toastEl.querySelector('.toast-body');
        if (toastBody) {
            toastBody.innerHTML = `<i class="bi bi-check-circle-fill text-success me-2"></i> ${message}`;
        }
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// ==========================================
// RENDER DINAMIS & FILTER PUBLIKASI
// ==========================================

function renderPublications(filter = 'all') {
    const container = document.getElementById('publication-list');
    
    // Jika container belum ada di DOM, tunggu 100ms
    if (!container) {
        setTimeout(() => renderPublications(filter), 100);
        return;
    }

    // Pastikan data publikasi sudah dimuat
    if (typeof publicationsData === 'undefined' || !publicationsData.length) {
        container.innerHTML = `<div class="text-center text-muted py-5 border rounded-3 bg-white">Data publikasi tidak ditemukan atau gagal dimuat.</div>`;
        return;
    }

    const filteredData = publicationsData.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'first-author') return item.role === 'first-author';
        if (filter === 'co-author') return item.role === 'co-author';
        if (filter === 'international') return item.type === 'international';
        if (filter === 'national') return item.type === 'national';
        return true;
    });

    if (filteredData.length === 0) {
        container.innerHTML = `<div class="text-center text-muted py-5 border rounded-3 bg-white">Tidak ada publikasi ditemukan untuk kategori ini.</div>`;
        return;
    }

    container.innerHTML = filteredData.map(pub => {
        const roleBadge = pub.role === 'first-author' 
            ? `<span class="badge bg-primary"><i class="bi bi-person-fill me-1"></i>First Author</span>` 
            : `<span class="badge bg-secondary"><i class="bi bi-people-fill me-1"></i>Co-Author</span>`;
            
        const typeBadge = pub.type === 'international' 
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle">Jurnal Internasional</span>` 
            : `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Jurnal Nasional / SINTA</span>`;

        return `
            <div class="card card-custom p-4 border-0 shadow-sm pub-item bg-white">
                <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-3">
                    <div>
                        <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            ${roleBadge}
                            ${typeBadge}
                            <span class="badge bg-light text-dark border">${pub.year}</span>
                        </div>
                        <h5 class="fw-bold text-dark mb-2">${pub.title}</h5>
                        <p class="text-muted small mb-1">${highlightAuthor(pub.authors, "Gemilang Rahmadara")}</p>
                        <p class="text-secondary small mb-0"><em>${pub.journal}</em>, ${pub.volume}</p>
                    </div>
                </div>

                <!-- Action Bar Sitasi & Akses -->
                <div class="pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-sm btn-primary rounded-2" onclick="copyCitation('${pub.id}-apa')">
                            <i class="bi bi-quote me-1"></i> Salin APA
                        </button>
                        <button class="btn btn-sm btn-outline-secondary rounded-2" onclick="copyCode('${pub.id}-bib')">
                            <i class="bi bi-code-square me-1"></i> Salin BibTeX
                        </button>
                        <button class="btn btn-sm btn-outline-success rounded-2" onclick="downloadBib('${pub.id}.bib', '${pub.id}-bib')">
                            <i class="bi bi-download me-1"></i> Unduh .bib
                        </button>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        ${pub.pdfUrl && pub.pdfUrl !== '#' ? `<a href="${pub.pdfUrl}" target="_blank" class="btn btn-sm btn-outline-danger rounded-2"><i class="bi bi-file-earmark-pdf me-1"></i> PDF Fulltext</a>` : ''}
                        ${pub.doi && pub.doi !== '#' ? `<a href="${pub.doi}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-dark rounded-2"><i class="bi bi-box-arrow-up-right me-1"></i> DOI / Link</a>` : ''}
                    </div>
                </div>

                <!-- Hidden Textarea untuk Menyimpan Teks Sitasi -->
                <textarea id="${pub.id}-apa" class="d-none">${pub.citationApa}</textarea>
                <textarea id="${pub.id}-bib" class="d-none">${pub.citationBibtex}</textarea>
            </div>
        `;
    }).join('');

    updatePublicationCount(publicationsData.length);
}

// Menebalkan Nama Gemilang Rahmadara Otomatis
function highlightAuthor(authorsString, nameToHighlight) {
    if (!authorsString) return '';
    return authorsString.replace(new RegExp(nameToHighlight, 'g'), `<strong>${nameToHighlight}</strong>`);
}

// Mengupdate Counter Publikasi
function updatePublicationCount(count) {
    const counterEl = document.querySelector('[data-publication-count]');
    if (counterEl) counterEl.textContent = `${count}+`;
}

// ==========================================
// INISIALISASI
// ==========================================

function initPublications() {
    renderPublications('all');

    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetBtn = e.currentTarget;
            filterButtons.forEach(b => b.classList.remove('active'));
            targetBtn.classList.add('active');
            renderPublications(targetBtn.getAttribute('data-filter'));
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPublications);
} else {
    initPublications();
}