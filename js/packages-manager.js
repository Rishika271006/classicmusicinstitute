/**
 * Classic Music Institute - Packages Management Engine
 * Domain: classicinstitute.com
 * Handles package data, localStorage persistence, and dynamic rendering.
 */

const DEFAULT_PACKAGES = [
  {
    id: "pkg-foundation",
    name: "Foundation Starter",
    badge: "Beginner Choice",
    isFeatured: false,
    subtitle: "Perfect for hobbyists and beginners exploring an instrument or vocal lessons for the first time.",
    monthlyPrice: 3800,
    quarterlyPrice: 10260,
    annualPrice: 36480,
    sessionInfo: "8 Private Lessons (₹475 / session)",
    features: [
      "8 Private 1-on-1 Sessions (2 classes per week)",
      "Fundamental technique, posture, and note reading",
      "Studio instrument access at Sector 34-A during lessons",
      "Complimentary starter sheet music & practice booklet",
      "1 makeup lesson allowed per month (24h notice)"
    ],
    buttonText: "Enroll in Foundation",
    status: "active"
  },
  {
    id: "pkg-conservatory",
    name: "Graded Conservatory",
    badge: "★ Most Popular Choice",
    isFeatured: true,
    subtitle: "Comprehensive syllabus for Trinity College London, ABRSM, Rockschool, or Gandharva exam certification.",
    monthlyPrice: 6500,
    quarterlyPrice: 17550,
    annualPrice: 62400,
    sessionInfo: "8 Lessons + Studio Practice Suites",
    features: [
      "8 In-Depth 1-on-1 Sessions with Certified Senior Maestro",
      "Official Trinity / ABRSM Exam Registration assistance",
      "3 Hours/Week Free Access to sound-treated studio practice rooms",
      "Ear training & Music Theory Grade modules included",
      "Annual Classic Gala stage recital participation",
      "Flexible 24-hr session rescheduling (up to 2/mo)"
    ],
    buttonText: "Enroll in Graded Program",
    status: "active"
  },
  {
    id: "pkg-virtuoso",
    name: "Virtuoso Intensive",
    badge: "Conservatory Grade",
    isFeatured: false,
    subtitle: "Designed for serious performance artists, university audition aspirants, and advanced Grades 6 to 8.",
    monthlyPrice: 10500,
    quarterlyPrice: 28350,
    annualPrice: 100800,
    sessionInfo: "12 Intensive Sessions + Recording Booth",
    features: [
      "12 Intensive 1-on-1 Sessions with Department Head / Fellow",
      "Unlimited Solo Studio Practice in Sector 34-A suites",
      "1 Free Professional Studio Track Recording per quarter",
      "Preparation for ATCL / LTCL & DipABRSM Diplomas",
      "Priority scheduling & unlimited makeup rescheduling"
    ],
    buttonText: "Enroll in Virtuoso Track",
    status: "active"
  }
];

const PackagesManager = {
  STORAGE_KEY: "classic_institute_packages_v1",

  // Retrieve all packages from localStorage (or defaults)
  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read from localStorage, using defaults", e);
    }
    // Save defaults if empty
    this.save(DEFAULT_PACKAGES);
    return DEFAULT_PACKAGES;
  },

  // Save array of packages to localStorage
  save(packages) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(packages));
      window.dispatchEvent(new CustomEvent('packagesUpdated', { detail: packages }));
    } catch (e) {
      console.error("Failed to save packages to localStorage", e);
    }
  },

  // Find package by ID
  getById(id) {
    const packages = this.getAll();
    return packages.find(p => p.id === id) || null;
  },

  // Add new package
  add(pkgData) {
    const packages = this.getAll();
    const newPkg = {
      id: pkgData.id || "pkg-" + Date.now(),
      name: pkgData.name?.trim() || "Untitled Package",
      badge: pkgData.badge?.trim() || "",
      isFeatured: Boolean(pkgData.isFeatured),
      subtitle: pkgData.subtitle?.trim() || "",
      monthlyPrice: Number(pkgData.monthlyPrice) || 0,
      quarterlyPrice: Number(pkgData.quarterlyPrice) || 0,
      annualPrice: Number(pkgData.annualPrice) || 0,
      sessionInfo: pkgData.sessionInfo?.trim() || "8 Lessons / Month",
      features: Array.isArray(pkgData.features) ? pkgData.features.filter(f => f && f.trim()) : [],
      buttonText: pkgData.buttonText?.trim() || "Enroll Now",
      status: pkgData.status === "draft" ? "draft" : "active"
    };

    // If marked featured, optionally unfeature others if desired, or keep multiple
    packages.push(newPkg);
    this.save(packages);
    return newPkg;
  },

  // Update existing package
  update(id, updatedFields) {
    const packages = this.getAll();
    const index = packages.findIndex(p => p.id === id);
    if (index !== -1) {
      packages[index] = {
        ...packages[index],
        ...updatedFields,
        monthlyPrice: updatedFields.monthlyPrice !== undefined ? Number(updatedFields.monthlyPrice) : packages[index].monthlyPrice,
        quarterlyPrice: updatedFields.quarterlyPrice !== undefined ? Number(updatedFields.quarterlyPrice) : packages[index].quarterlyPrice,
        annualPrice: updatedFields.annualPrice !== undefined ? Number(updatedFields.annualPrice) : packages[index].annualPrice,
        features: Array.isArray(updatedFields.features) ? updatedFields.features.filter(f => f && f.trim()) : packages[index].features
      };
      this.save(packages);
      return packages[index];
    }
    return null;
  },

  // Delete package by ID
  delete(id) {
    let packages = this.getAll();
    const initialLen = packages.length;
    packages = packages.filter(p => p.id !== id);
    this.save(packages);
    return packages.length < initialLen;
  },

  // Duplicate a package
  duplicate(id) {
    const source = this.getById(id);
    if (!source) return null;
    const cloned = JSON.parse(JSON.stringify(source));
    cloned.id = "pkg-" + Date.now();
    cloned.name = cloned.name + " (Copy)";
    cloned.isFeatured = false;
    const packages = this.getAll();
    packages.push(cloned);
    this.save(packages);
    return cloned;
  },

  // Toggle active/draft status
  toggleStatus(id) {
    const pkg = this.getById(id);
    if (!pkg) return null;
    const newStatus = pkg.status === "active" ? "draft" : "active";
    return this.update(id, { status: newStatus });
  },

  // Reset to default institute packages
  resetDefaults() {
    this.save(DEFAULT_PACKAGES);
    return DEFAULT_PACKAGES;
  },

  // Export current data as JSON
  exportJSON() {
    return JSON.stringify(this.getAll(), null, 2);
  },

  // Import packages from JSON string
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Basic schema sanitization
        const sanitized = parsed.map((item, idx) => ({
          id: item.id || `pkg-imported-${Date.now()}-${idx}`,
          name: item.name || "Imported Package",
          badge: item.badge || "",
          isFeatured: Boolean(item.isFeatured),
          subtitle: item.subtitle || "",
          monthlyPrice: Number(item.monthlyPrice) || 0,
          quarterlyPrice: Number(item.quarterlyPrice) || 0,
          annualPrice: Number(item.annualPrice) || 0,
          sessionInfo: item.sessionInfo || "8 Sessions / Month",
          features: Array.isArray(item.features) ? item.features : [],
          buttonText: item.buttonText || "Enroll Now",
          status: item.status === "draft" ? "draft" : "active"
        }));
        this.save(sanitized);
        return { success: true, count: sanitized.length };
      }
      return { success: false, error: "JSON array must not be empty" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Render packages on the public classes.html page
  renderOnPublicPage(containerId = "pricingCardsContainer", billingMode = "monthly") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const packages = this.getAll().filter(p => p.status === "active");
    if (packages.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding: 4rem 2rem; grid-column: 1/-1; background: #FAF7EE; border: 1px dashed var(--gold-primary); border-radius: 16px;">
          <h3 style="font-family: var(--font-heading); color: #0A0F1D; margin-bottom: 0.5rem;">No Active Packages Available</h3>
          <p style="color: #64748B; margin-bottom: 1.5rem;">Our admissions committee is currently updating syllabus terms. Please contact our front desk at SCO 64-65, Sector 34-A Chandigarh or call <strong>+91 83519 17891</strong>.</p>
          <a href="contact.html" class="btn btn-gold">Contact Admissions Desk</a>
        </div>
      `;
      return;
    }

    let html = "";
    packages.forEach(pkg => {
      const isFeatured = Boolean(pkg.isFeatured);
      const featuredClass = isFeatured ? "featured" : "";
      const popularBadge = pkg.badge ? `<span class="pricing-badge-popular">${pkg.badge}</span>` : "";

      let displayPrice = (Number(pkg.monthlyPrice) || 0).toLocaleString("en-IN");
      let periodText = "/ Month";

      if (billingMode === "quarterly") {
        displayPrice = (Number(pkg.quarterlyPrice) || (pkg.monthlyPrice * 3 * 0.9)).toLocaleString("en-IN");
        periodText = "/ 3 Months (10% Off)";
      } else if (billingMode === "annual") {
        displayPrice = (Number(pkg.annualPrice) || (pkg.monthlyPrice * 12 * 0.8)).toLocaleString("en-IN");
        periodText = "/ Year (20% Off)";
      }

      const featuresList = Array.isArray(pkg.features) ? pkg.features : [];
      const featuresHtml = featuresList.map(feat => `
        <li>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${feat}</span>
        </li>
      `).join("");

      const btnClass = isFeatured ? "btn-gold" : "btn-navy";

      html += `
        <div class="pricing-card ${featuredClass}" id="card-${pkg.id}" data-package-id="${pkg.id}">
          ${popularBadge}
          <h3 class="pricing-tier-name">${pkg.name}</h3>
          <p class="pricing-tier-sub">${pkg.subtitle || ""}</p>
          
          <div class="price-box">
            <span class="price-val">₹<span data-price-monthly="${(Number(pkg.monthlyPrice) || 0).toLocaleString('en-IN')}" data-price-quarterly="${(Number(pkg.quarterlyPrice) || 0).toLocaleString('en-IN')}" data-price-annual="${(Number(pkg.annualPrice) || 0).toLocaleString('en-IN')}">${displayPrice}</span></span>
            <span class="price-period">${periodText}</span>
            <span class="price-per-session">${pkg.sessionInfo || ""}</span>
          </div>

          <ul class="pricing-features">
            ${featuresHtml}
          </ul>

          <button type="button" class="btn ${btnClass} open-trial-modal" data-course="${pkg.name} Fee Package" style="width: 100%;">
            <span>${pkg.buttonText || "Enroll Now"}</span>
          </button>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach trial modal click listeners to newly rendered buttons
    const newModalButtons = container.querySelectorAll('.open-trial-modal');
    const trialModal = document.getElementById('trialModal');
    const modalSelect = document.getElementById('modalCourseSelect');

    newModalButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        if (!trialModal) return;
        const courseName = this.getAttribute('data-course');
        if (modalSelect && courseName) {
          // Check if option exists, otherwise add it
          let found = false;
          for (let i = 0; i < modalSelect.options.length; i++) {
            if (modalSelect.options[i].value === courseName) {
              modalSelect.selectedIndex = i;
              found = true;
              break;
            }
          }
          if (!found) {
            const newOption = new Option(courseName, courseName, true, true);
            modalSelect.add(newOption, 0);
          }
        }
        trialModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  }
};

// Global export for browser
window.PackagesManager = PackagesManager;
