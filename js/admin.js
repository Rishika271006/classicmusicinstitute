/**
 * Classic Music Institute - Admin Panel Controller
 * Domain: classicinstitute.com
 * Handles authentication, package CRUD operations, auto-calculations, and import/export.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- State Variables ---
  let currentView = 'table'; // 'table' or 'grid'
  let currentFilter = 'all';  // 'all', 'active', 'draft'
  let currentSort = 'default';
  let searchQuery = '';
  let editingPackageId = null;
  let deletingPackageId = null;
  let tempFeatures = [];

  // --- DOM Elements ---
  const authOverlay = document.getElementById('authOverlay');
  const loginForm = document.getElementById('loginForm');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const authError = document.getElementById('authError');
  const quickFillBtn = document.getElementById('quickFillBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  const packagesTableBody = document.getElementById('packagesTableBody');
  const packagesCardGrid = document.getElementById('packagesCardGrid');
  const searchInput = document.getElementById('searchInput');
  const filterSelect = document.getElementById('filterSelect');
  const sortSelect = document.getElementById('sortSelect');
  const viewTableBtn = document.getElementById('viewTableBtn');
  const viewGridBtn = document.getElementById('viewGridBtn');

  // Stats
  const statTotalPackages = document.getElementById('statTotalPackages');
  const statActivePackages = document.getElementById('statActivePackages');
  const statFeaturedPkg = document.getElementById('statFeaturedPkg');
  const statMinFee = document.getElementById('statMinFee');

  // Modals
  const packageModal = document.getElementById('packageModal');
  const packageModalTitle = document.getElementById('packageModalTitle');
  const packageForm = document.getElementById('packageForm');
  const modalCloseBtns = document.querySelectorAll('.admin-modal-close, .modal-cancel-btn');

  // Delete Modal
  const deleteModal = document.getElementById('deleteModal');
  const deletePkgName = document.getElementById('deletePkgName');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  // Import Modal
  const importModal = document.getElementById('importModal');
  const importJsonTextarea = document.getElementById('importJsonTextarea');
  const importFileInput = document.getElementById('importFileInput');
  const confirmImportBtn = document.getElementById('confirmImportBtn');

  // Features List in Form
  const featuresListEl = document.getElementById('featuresList');
  const newFeatureInput = document.getElementById('newFeatureInput');
  const addFeatureBtn = document.getElementById('addFeatureBtn');
  const autoCalcBtn = document.getElementById('autoCalcBtn');

  // Action Buttons
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const openImportModalBtn = document.getElementById('openImportModalBtn');

  // --- 1. Authentication Logic ---
  const AUTH_KEY = 'classic_admin_authenticated';

  function checkAuth() {
    const isAuthed = sessionStorage.getItem(AUTH_KEY) === 'true';
    if (!isAuthed) {
      authOverlay.classList.remove('hidden');
    } else {
      authOverlay.classList.add('hidden');
      renderDashboard();
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = loginUsername.value.trim();
      const pass = loginPassword.value.trim();

      // Demo institute administrator credentials
      if (user === 'admin' && pass === 'classic2026') {
        sessionStorage.setItem(AUTH_KEY, 'true');
        authError.classList.remove('visible');
        authOverlay.classList.add('hidden');
        showToast('Successfully logged in as Conservatory Administrator', 'success');
        renderDashboard();
      } else {
        authError.textContent = 'Invalid credentials. Use demo: admin / classic2026';
        authError.classList.add('visible');
      }
    });
  }

  if (quickFillBtn) {
    quickFillBtn.addEventListener('click', () => {
      loginUsername.value = 'admin';
      loginPassword.value = 'classic2026';
      loginForm.dispatchEvent(new Event('submit'));
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Log out from Classic Music Institute Admin Portal?')) {
        sessionStorage.removeItem(AUTH_KEY);
        authOverlay.classList.remove('hidden');
        showToast('Logged out safely', 'info');
      }
    });
  }

  // --- 2. Toast Notifications ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = '✓';
    if (type === 'danger') icon = '✕';
    if (type === 'info') icon = 'ℹ';

    toast.innerHTML = `
      <span style="font-weight: bold; font-size: 1.1rem;">${icon}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- 3. Dashboard Data & Filtering ---
  function getFilteredPackages() {
    let list = PackagesManager.getAll();

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (currentFilter !== 'all') {
      list = list.filter(p => p.status === currentFilter);
    }

    // Sorting
    if (currentSort === 'price-asc') {
      list.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    } else if (currentSort === 'price-desc') {
      list.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
    } else if (currentSort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }

  function updateMetrics() {
    const all = PackagesManager.getAll();
    const active = all.filter(p => p.status === 'active');
    const featured = all.find(p => p.isFeatured && p.status === 'active') || all.find(p => p.isFeatured);

    if (statTotalPackages) statTotalPackages.textContent = all.length;
    if (statActivePackages) statActivePackages.textContent = active.length;
    if (statFeaturedPkg) statFeaturedPkg.textContent = featured ? featured.name : 'None Set';

    if (statMinFee) {
      if (active.length > 0) {
        const minPrice = Math.min(...active.map(p => p.monthlyPrice || 0));
        statMinFee.textContent = `₹${minPrice.toLocaleString('en-IN')}`;
      } else {
        statMinFee.textContent = '—';
      }
    }
  }

  // --- 4. Render Table & Grid Views ---
  function renderDashboard() {
    updateMetrics();
    const packages = getFilteredPackages();

    if (currentView === 'table') {
      packagesTableBody.parentElement.style.display = 'table';
      packagesCardGrid.style.display = 'none';
      renderTableView(packages);
    } else {
      packagesTableBody.parentElement.style.display = 'none';
      packagesCardGrid.style.display = 'grid';
      renderGridView(packages);
    }
  }

  function renderTableView(packages) {
    if (packages.length === 0) {
      packagesTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            No fee packages match the current search / filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    packagesTableBody.innerHTML = packages.map(pkg => {
      const isAct = pkg.status === 'active';
      const statusPill = isAct 
        ? `<span class="status-pill active">● Active</span>`
        : `<span class="status-pill draft">● Draft</span>`;

      const badgePill = pkg.badge 
        ? `<span class="badge-pill">${pkg.badge}</span>` 
        : `<span style="color: var(--text-muted); font-size: 0.8rem;">—</span>`;

      const featuredStar = pkg.isFeatured 
        ? `<span class="pkg-star-featured" title="Featured Package on public page">★</span>` 
        : '';

      const featuresCount = Array.isArray(pkg.features) ? pkg.features.length : 0;

      return `
        <tr data-id="${pkg.id}">
          <td>
            <div class="pkg-title-cell">
              <div class="pkg-title-row">
                <span class="pkg-name-text">${pkg.name}</span>
                ${featuredStar}
              </div>
              <span class="pkg-sub-text" title="${pkg.subtitle || ''}">${pkg.subtitle || 'No subtitle provided'}</span>
            </div>
          </td>
          <td>${badgePill}</td>
          <td>
            <div class="price-cell-main">₹${(pkg.monthlyPrice || 0).toLocaleString('en-IN')}</div>
            <div class="price-cell-sub">per month</div>
          </td>
          <td>
            <div class="price-cell-main">₹${(pkg.quarterlyPrice || 0).toLocaleString('en-IN')}</div>
            <div class="price-cell-sub">per 3 months</div>
          </td>
          <td>
            <div class="price-cell-main">₹${(pkg.annualPrice || 0).toLocaleString('en-IN')}</div>
            <div class="price-cell-sub">per year</div>
          </td>
          <td>
            <button type="button" class="btn-toggle-status" data-id="${pkg.id}" title="Click to toggle Active / Draft" style="background: none; border: none; cursor: pointer;">
              ${statusPill}
            </button>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">${featuresCount} features</div>
          </td>
          <td>
            <div class="actions-cell">
              <button type="button" class="action-btn-icon btn-edit" data-id="${pkg.id}" title="Edit Package">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button type="button" class="action-btn-icon btn-duplicate" data-id="${pkg.id}" title="Duplicate Package">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button type="button" class="action-btn-icon delete btn-delete" data-id="${pkg.id}" data-name="${pkg.name}" title="Delete Package">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachTableActionListeners();
  }

  function renderGridView(packages) {
    if (packages.length === 0) {
      packagesCardGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          No fee packages match the current criteria.
        </div>
      `;
      return;
    }

    packagesCardGrid.innerHTML = packages.map(pkg => {
      const isFeatured = Boolean(pkg.isFeatured);
      const featuredClass = isFeatured ? 'featured' : '';
      const badgeHtml = pkg.badge ? `<span class="admin-card-badge">${pkg.badge}</span>` : '<span></span>';
      const featuresList = Array.isArray(pkg.features) ? pkg.features : [];

      return `
        <div class="admin-preview-card ${featuredClass}" data-id="${pkg.id}">
          <div class="admin-card-head">
            ${badgeHtml}
            <span class="status-pill ${pkg.status}">${pkg.status}</span>
          </div>

          <h3 class="admin-card-title">${pkg.name}</h3>
          <p class="admin-card-desc">${pkg.subtitle || ''}</p>

          <div class="admin-card-pricing-box">
            <div class="admin-card-price-primary">
              <span class="admin-card-price-val">₹${(pkg.monthlyPrice || 0).toLocaleString('en-IN')}</span>
              <span class="admin-card-price-period">/ Month</span>
            </div>
            <div class="admin-card-breakdown">
              <div>Quarterly: <strong>₹${(pkg.quarterlyPrice || 0).toLocaleString('en-IN')}</strong></div>
              <div>Annual: <strong>₹${(pkg.annualPrice || 0).toLocaleString('en-IN')}</strong></div>
            </div>
            <div style="font-size: 0.775rem; color: var(--gold-light); margin-top: 0.4rem;">${pkg.sessionInfo || ''}</div>
          </div>

          <ul class="admin-card-features">
            ${featuresList.slice(0, 5).map(f => `
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>${f}</span>
              </li>
            `).join('')}
            ${featuresList.length > 5 ? `<li style="color: var(--text-muted); font-size: 0.75rem;">+ ${featuresList.length - 5} more features...</li>` : ''}
          </ul>

          <div class="admin-card-footer-actions">
            <button type="button" class="btn btn-sm btn-outline btn-edit" data-id="${pkg.id}" style="flex: 1;">Edit</button>
            <button type="button" class="btn btn-sm btn-outline btn-duplicate" data-id="${pkg.id}" title="Duplicate">Copy</button>
            <button type="button" class="btn btn-sm btn-danger-outline btn-delete" data-id="${pkg.id}" data-name="${pkg.name}" title="Delete">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    attachTableActionListeners();
  }

  function attachTableActionListeners() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        openDeleteModal(id, name);
      });
    });

    // Duplicate buttons
    document.querySelectorAll('.btn-duplicate').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const cloned = PackagesManager.duplicate(id);
        if (cloned) {
          showToast(`Duplicated package as "${cloned.name}"`, 'success');
          renderDashboard();
        }
      });
    });

    // Quick toggle status buttons
    document.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const updated = PackagesManager.toggleStatus(id);
        if (updated) {
          showToast(`Status changed to ${updated.status}`, 'info');
          renderDashboard();
        }
      });
    });
  }

  // --- 5. Add / Edit Package Modal Logic ---
  function openAddModal() {
    editingPackageId = null;
    packageModalTitle.textContent = 'Add New Conservatory Package';
    packageForm.reset();
    tempFeatures = [
      "8 Private 1-on-1 Sessions (2 classes per week)",
      "Fundamental technique, posture, and note reading",
      "Studio instrument access at Sector 34-A during lessons"
    ];
    renderFeaturesList();
    document.getElementById('pkgFeatured').checked = false;
    document.getElementById('pkgStatus').value = 'active';
    document.getElementById('pkgButtonText').value = 'Enroll in Program';
    document.getElementById('pkgSessionInfo').value = '8 Private Lessons / Month';
    packageModal.classList.add('active');
  }

  function openEditModal(id) {
    const pkg = PackagesManager.getById(id);
    if (!pkg) return;

    editingPackageId = id;
    packageModalTitle.textContent = `Edit Package: ${pkg.name}`;

    document.getElementById('pkgName').value = pkg.name || '';
    document.getElementById('pkgBadge').value = pkg.badge || '';
    document.getElementById('pkgFeatured').checked = Boolean(pkg.isFeatured);
    document.getElementById('pkgStatus').value = pkg.status || 'active';
    document.getElementById('pkgSubtitle').value = pkg.subtitle || '';
    document.getElementById('pkgMonthlyPrice').value = pkg.monthlyPrice || '';
    document.getElementById('pkgQuarterlyPrice').value = pkg.quarterlyPrice || '';
    document.getElementById('pkgAnnualPrice').value = pkg.annualPrice || '';
    document.getElementById('pkgSessionInfo').value = pkg.sessionInfo || '';
    document.getElementById('pkgButtonText').value = pkg.buttonText || 'Enroll Now';

    tempFeatures = Array.isArray(pkg.features) ? [...pkg.features] : [];
    renderFeaturesList();

    packageModal.classList.add('active');
  }

  function renderFeaturesList() {
    featuresListEl.innerHTML = '';
    if (tempFeatures.length === 0) {
      featuresListEl.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.4rem;">No features added yet. Add one below or click suggested chips.</div>`;
      return;
    }

    tempFeatures.forEach((feat, index) => {
      const row = document.createElement('div');
      row.className = 'feature-item-row';
      row.innerHTML = `
        <span class="feature-item-text">${feat}</span>
        <button type="button" class="feature-item-del" data-index="${index}" title="Remove feature">×</button>
      `;
      featuresListEl.appendChild(row);
    });

    featuresListEl.querySelectorAll('.feature-item-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        tempFeatures.splice(idx, 1);
        renderFeaturesList();
      });
    });
  }

  // Adding feature item
  function addFeatureItem() {
    const val = newFeatureInput.value.trim();
    if (val) {
      tempFeatures.push(val);
      newFeatureInput.value = '';
      renderFeaturesList();
    }
  }

  if (addFeatureBtn) {
    addFeatureBtn.addEventListener('click', addFeatureItem);
  }

  if (newFeatureInput) {
    newFeatureInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addFeatureItem();
      }
    });
  }

  // Preset chips
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-text');
      if (text && !tempFeatures.includes(text)) {
        tempFeatures.push(text);
        renderFeaturesList();
      }
    });
  });

  // Auto-calculation of quarterly (10% off) & annual (20% off)
  if (autoCalcBtn) {
    autoCalcBtn.addEventListener('click', () => {
      const monthly = parseFloat(document.getElementById('pkgMonthlyPrice').value);
      if (!monthly || monthly <= 0) {
        alert('Please enter a valid monthly price first.');
        return;
      }
      // Quarterly: 3 months with 10% discount
      const quarterly = Math.round(monthly * 3 * 0.9);
      // Annual: 12 months with 20% discount
      const annual = Math.round(monthly * 12 * 0.8);

      document.getElementById('pkgQuarterlyPrice').value = quarterly;
      document.getElementById('pkgAnnualPrice').value = annual;
      showToast('Calculated Quarterly (10% off) and Annual (20% off) fees', 'info');
    });
  }

  // Form submit handler
  if (packageForm) {
    packageForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('pkgName').value.trim();
      const monthly = parseFloat(document.getElementById('pkgMonthlyPrice').value);

      if (!name) {
        alert('Please enter package title.');
        return;
      }

      if (isNaN(monthly) || monthly < 0) {
        alert('Please enter a valid monthly price.');
        return;
      }

      let quarterly = parseFloat(document.getElementById('pkgQuarterlyPrice').value);
      let annual = parseFloat(document.getElementById('pkgAnnualPrice').value);

      if (isNaN(quarterly)) quarterly = Math.round(monthly * 3 * 0.9);
      if (isNaN(annual)) annual = Math.round(monthly * 12 * 0.8);

      const pkgData = {
        name,
        badge: document.getElementById('pkgBadge').value.trim(),
        isFeatured: document.getElementById('pkgFeatured').checked,
        status: document.getElementById('pkgStatus').value,
        subtitle: document.getElementById('pkgSubtitle').value.trim(),
        monthlyPrice: monthly,
        quarterlyPrice: quarterly,
        annualPrice: annual,
        sessionInfo: document.getElementById('pkgSessionInfo').value.trim() || '8 Private Lessons / Month',
        features: tempFeatures,
        buttonText: document.getElementById('pkgButtonText').value.trim() || 'Enroll Now'
      };

      if (editingPackageId) {
        PackagesManager.update(editingPackageId, pkgData);
        showToast(`Package "${name}" updated successfully!`, 'success');
      } else {
        PackagesManager.add(pkgData);
        showToast(`New package "${name}" published!`, 'success');
      }

      packageModal.classList.remove('active');
      renderDashboard();
    });
  }

  // --- 6. Delete Package Modal Logic ---
  function openDeleteModal(id, name) {
    deletingPackageId = id;
    deletePkgName.textContent = `"${name}"`;
    deleteModal.classList.add('active');
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (deletingPackageId) {
        const deleted = PackagesManager.delete(deletingPackageId);
        if (deleted) {
          showToast('Package deleted from registry', 'danger');
          renderDashboard();
        }
        deleteModal.classList.remove('active');
        deletingPackageId = null;
      }
    });
  }

  // --- 7. Reset Defaults ---
  if (resetDefaultsBtn) {
    resetDefaultsBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to restore the 3 official Institute Default Packages?\n\nThis will reset any custom packages added.')) {
        PackagesManager.resetDefaults();
        showToast('Restored official Institute defaults', 'success');
        renderDashboard();
      }
    });
  }

  // --- 8. Export & Import JSON Backups ---
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const dataStr = PackagesManager.exportJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `classic-institute-packages-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Exported packages JSON backup', 'info');
    });
  }

  if (openImportModalBtn) {
    openImportModalBtn.addEventListener('click', () => {
      importJsonTextarea.value = '';
      importFileInput.value = '';
      importModal.classList.add('active');
    });
  }

  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          importJsonTextarea.value = event.target.result;
        };
        reader.readAsText(file);
      }
    });
  }

  if (confirmImportBtn) {
    confirmImportBtn.addEventListener('click', () => {
      const jsonStr = importJsonTextarea.value.trim();
      if (!jsonStr) {
        alert('Please paste valid JSON or select a JSON backup file.');
        return;
      }
      const res = PackagesManager.importJSON(jsonStr);
      if (res.success) {
        showToast(`Successfully imported ${res.count} packages!`, 'success');
        importModal.classList.remove('active');
        renderDashboard();
      } else {
        alert('Failed to import JSON: ' + (res.error || 'Invalid format'));
      }
    });
  }

  // --- 9. Close Modals ---
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // --- 10. Toolbar Controls (Search, Filter, Sort, View) ---
  if (openAddModalBtn) {
    openAddModalBtn.addEventListener('click', openAddModal);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderDashboard();
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      renderDashboard();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderDashboard();
    });
  }

  if (viewTableBtn && viewGridBtn) {
    viewTableBtn.addEventListener('click', () => {
      currentView = 'table';
      viewTableBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      renderDashboard();
    });

    viewGridBtn.addEventListener('click', () => {
      currentView = 'grid';
      viewGridBtn.classList.add('active');
      viewTableBtn.classList.remove('active');
      renderDashboard();
    });
  }

  // Check initial authentication
  checkAuth();
});
