// FULL merged script: reviews (Django) + hamburger + service form + animations
document.getElementById("year").textContent = new Date().getFullYear();

document.addEventListener("DOMContentLoaded", () => {
  // ----- CONFIG -----
  const API_URL = "http://127.0.0.1:8000/api/reviews/"; // adjust if your Django runs elsewhere
  const FALLBACK_TO_LOCAL = true; // if fetch fails, use localStorage

  // ----- SERVICE CARD ANIMATION -----
  const serviceCards = document.querySelectorAll(".service-card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  serviceCards.forEach((card) => observer.observe(card));

  // ----- STATE -----
  let reviews = []; // will hold reviews from server (or fallback)
  const reviewsPerPage = 4;
  let currentPage = 1;
  let currentFilter = "all";

  // ----- NOTIFICATION SYSTEM -----
  function showNotification(title, message, duration = 3000) {
    let notificationContainer = document.getElementById("notificationContainer");
    if (!notificationContainer) {
      notificationContainer = document.createElement("div");
      notificationContainer.id = "notificationContainer";
      notificationContainer.style.cssText =
        "position: fixed; top: 100px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 15px;";
      document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement("div");
    notification.style.cssText =
      "background: white; border-left: 4px solid #28a745; border-radius: 6px; padding: 15px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); display:flex; align-items:center; gap:15px; max-width:350px; transform: translateX(400px); transition: transform 0.4s ease-out;";

    notification.innerHTML = `
      <div style="width:30px;height:30px;background:#28a745;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="fas fa-check" style="color:white;font-size:14px;"></i>
      </div>
      <div style="flex:1;">
        <div style="font-weight:600;margin-bottom:5px;color:#28a745;">${title}</div>
        <div style="color:#666;font-size:0.9rem;">${message}</div>
      </div>
      <button style="background:none;border:none;font-size:1.2rem;color:#888;cursor:pointer;padding:0;margin-left:10px;">&times;</button>
    `;

    notificationContainer.appendChild(notification);
    setTimeout(() => (notification.style.transform = "translateX(0)"), 10);

    const closeBtn = notification.querySelector("button");
    closeBtn.addEventListener("click", () => {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => notification.remove(), 400);
    });

    if (duration > 0) {
      setTimeout(() => {
        notification.style.transform = "translateX(400px)";
        setTimeout(() => notification.remove(), 400);
      }, duration);
    }
  }

  // ----- HELPER: normalize server/local objects -----
  // Accept objects that use either: { review } or { comment }, and date or created_at
  function normalizeReview(raw) {
    return {
      id: raw.id ?? Date.now(),
      name: raw.name ?? raw.username ?? "Anonymous",
      rating: Number(raw.rating ?? raw.stars ?? 0),
      review: raw.review ?? raw.comment ?? raw.comments ?? "",
      // prefer created_at (ISO), else 'date' (might be just YYYY-MM-DD), else now
      date:
        raw.created_at ??
        raw.createdAt ??
        raw.date ??
        new Date().toISOString(),
    };
  }

  // ----- RENDER: reviews list, with filters and pagination -----
  function displayReviews() {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    reviewsList.innerHTML = "";

    // Filter
    let filtered = reviews;
    if (currentFilter !== "all") {
      filtered = reviews.filter((r) => Number(r.rating) === Number(currentFilter));
    }

    // Pagination
    const totalPages = Math.ceil(filtered.length / reviewsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + reviewsPerPage);

    if (paginated.length === 0) {
      reviewsList.innerHTML = `<div class="no-reviews"><p>No reviews found.</p></div>`;
    } else {
      paginated.forEach((raw) => {
        const review = normalizeReview(raw);
        const reviewDate = new Date(review.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
          starsHtml += `<i class="${i <= review.rating ? "fas fa-star" : "far fa-star"}"></i>`;
        }

        const div = document.createElement("div");
        div.className = "review-card";

        const reviewText = review.review || "No comment provided";
        const shortText = reviewText.length > 200 ? reviewText.slice(0, 200) + "..." : reviewText;

        div.innerHTML = `
          <div class="review-header">
            <span class="reviewer-name">${escapeHtml(review.name)}</span>
            <span class="review-date">${reviewDate}</span>
          </div>
          <div class="review-stars">${starsHtml}</div>
          <p class="review-text">${escapeHtml(shortText)}</p>
          ${reviewText.length > 200 ? '<button class="toggle-btn">Show More</button>' : ''}
        `;

        reviewsList.appendChild(div);

        if (reviewText.length > 200) {
          const btn = div.querySelector(".toggle-btn");
          const p = div.querySelector(".review-text");
          btn.addEventListener("click", () => {
            if (btn.textContent === "Show More") {
              p.textContent = reviewText;
              btn.textContent = "Show Less";
            } else {
              p.textContent = shortText;
              btn.textContent = "Show More";
            }
          });
        }
      });
    }

    updatePagination(Math.max(1, Math.ceil(filtered.length / reviewsPerPage)));
  }

  // ----- PAGINATION CONTROLS -----
  function updatePagination(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";
    if (totalPages <= 1) return;

    // Prev
    if (currentPage > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.className = "pagination-btn";
      prevBtn.innerHTML = "&laquo; Previous";
      prevBtn.addEventListener("click", () => {
        currentPage--;
        displayReviews();
      });
      stylePrevNext(prevBtn, "#007bff");
      paginationContainer.appendChild(prevBtn);
    }

    // Page numbers (max visible 5)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `pagination-btn ${i === currentPage ? "active" : ""}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        displayReviews();
      });

      // style
      pageBtn.style.backgroundColor = "#f8f9fa";
      pageBtn.style.color = "#000000ff";
      pageBtn.style.border = "1px solid #dee2e6";
      pageBtn.style.borderRadius = "5px";
      pageBtn.style.padding = "6px 12px";
      pageBtn.style.margin = "0 2px";
      pageBtn.style.cursor = "pointer";
      pageBtn.style.transition = "all 0.3s ease";

      pageBtn.addEventListener("mouseover", () => {
        if (i !== currentPage) pageBtn.style.backgroundColor = "#cfcfd1ff";
      });
      pageBtn.addEventListener("mouseout", () => {
        if (i !== currentPage) pageBtn.style.backgroundColor = "#f8f9fa";
      });
      if (i === currentPage) {
        pageBtn.style.backgroundColor = "#cfcfd1ff";
        pageBtn.style.color = "#000000";
        pageBtn.style.fontWeight = "bold";
      }

      paginationContainer.appendChild(pageBtn);
    }

    // Next
    if (currentPage < totalPages) {
      const nextBtn = document.createElement("button");
      nextBtn.className = "pagination-btn";
      nextBtn.innerHTML = "Next &raquo;";
      nextBtn.addEventListener("click", () => {
        currentPage++;
        displayReviews();
      });
      stylePrevNext(nextBtn, "#28a745");
      paginationContainer.appendChild(nextBtn);
    }
  }

  function stylePrevNext(btn, bg) {
    btn.style.backgroundColor = bg;
    btn.style.color = "#fff";
    btn.style.borderRadius = "5px";
    btn.style.padding = "6px 12px";
    btn.style.margin = "0 5px";
    btn.style.cursor = "pointer";
    btn.addEventListener("mouseover", () => {
      btn.style.opacity = "0.9";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.opacity = "1";
    });
  }

  // ----- FETCH REVIEWS FROM DJANGO -----
  async function loadReviewsFromServer() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      // ensure we have normalized objects but keep original for reference
      reviews = data.map((r) => normalizeReview(r));
      // store a copy in localStorage as fallback
      try {
        localStorage.setItem("reviews", JSON.stringify(data));
      } catch (e) {
        // ignore storage errors
      }
      displayReviews();
    } catch (err) {
      console.error("Error fetching reviews:", err);
      showNotification("Error", "Failed to load reviews from server.", 4000);
      if (FALLBACK_TO_LOCAL) {
        loadReviewsFromLocal();
      }
    }
  }

  // ----- LOCALSTORAGE FALLBACK/UTILITY -----
  function loadReviewsFromLocal() {
    try {
      let stored = JSON.parse(localStorage.getItem("reviews")) || [];
      // Migration/normalize: map various field names
      stored = stored.map((r) => {
        // keep server-like shape if possible
        return normalizeReview(r);
      });
      reviews = stored;
      displayReviews();
      showNotification("Offline", "Showing local reviews (server unavailable).", 3000);
    } catch (e) {
      console.error("localStorage load error:", e);
      reviews = [];
      displayReviews();
    }
  }

  // ----- SUBMIT REVIEW (POST to server, fallback to local) -----
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const rating = parseInt(document.querySelector('input[name="rating"]:checked')?.value);
      const reviewText = document.getElementById("review").value.trim();

      if (!name || !rating || !reviewText) {
        showNotification("Error", "Please fill in all required fields.", 3000);
        return;
      }

      const payload = { name, rating, review: reviewText };

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          // try to read error message
          const text = await res.text().catch(() => "Error");
          throw new Error(`Server error: ${res.status} - ${text}`);
        }

        const saved = await res.json();
        // server returns created object (DRF returns serialized) — normalize to our shape
        const normalized = normalizeReview(saved);
        reviews.unshift(normalized);
        // also push to localStorage copy
        try {
          // maintain raw server-like shape in local storage
          const stored = JSON.parse(localStorage.getItem("reviews")) || [];
          stored.unshift(saved);
          localStorage.setItem("reviews", JSON.stringify(stored));
        } catch (e) {
          // ignore
        }

        currentPage = 1;
        currentFilter = "all";
        // reset filter buttons UI
        document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
        const allBtn = document.querySelector('[data-filter="all"]');
        if (allBtn) allBtn.classList.add("active");

        displayReviews();
        reviewForm.reset();
        showNotification("Thank You!", "Your review has been submitted.", 4000);
      } catch (err) {
        console.error("Submit error:", err);
        showNotification("Error", "Could not save review to server. Saving locally.", 4000);
        // fallback: store in localStorage so user doesn't lose it
        try {
          const fallbackObj = {
            id: Date.now(),
            name,
            rating,
            review: reviewText,
            date: new Date().toISOString(),
          };
          let stored = JSON.parse(localStorage.getItem("reviews")) || [];
          stored.unshift(fallbackObj);
          localStorage.setItem("reviews", JSON.stringify(stored));
          reviews.unshift(normalizeReview(fallbackObj));
          displayReviews();
          reviewForm.reset();
        } catch (e) {
          console.error("Fallback save failed:", e);
          showNotification("Error", "Could not save review locally.", 4000);
        }
      }
    });
  }

  // ----- FILTER BUTTONS -----
  document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      currentFilter = this.getAttribute("data-filter");
      currentPage = 1;
      displayReviews();
    });
  });

  // ----- INITIALIZATION: try server then fallback -----
  // Also remove specific unwanted names from local storage migration (keeps behavior you had)
  (function cleanLocalNames() {
    try {
      let local = JSON.parse(localStorage.getItem("reviews")) || [];
      const namesToRemove = ["Lydia Wandei", "Emily Davis", "Jennifer Lee", "James Njoroge"];
      local = local.filter((r) => !namesToRemove.includes(r.name));
      localStorage.setItem("reviews", JSON.stringify(local));
    } catch (e) {
      // ignore
    }
  })();

  // Try load from server, otherwise fallback to local
  loadReviewsFromServer();

  // ----- SERVICE FORM (unchanged) -----
  const serviceForm = document.getElementById("serviceForm");
  if (serviceForm) {
    serviceForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const sName = document.getElementById("name").value;
      const sEmail = document.getElementById("email").value;
      const sService = document.getElementById("service").value;
      if (sName && sEmail && sService) {
        alert("Thank you for your service request! We will contact you shortly.");
        serviceForm.reset();
      } else {
        alert("Please fill in all required fields.");
      }
    });
  }

  // ----- HAMBURGER NAV -----
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");
  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      hamburger.classList.toggle("open");
    });
  }

  // ----- SAFE HTML ESCAPE (very small) -----
  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
