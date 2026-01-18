document.getElementById("year").textContent = new Date().getFullYear();

// Service card animation
document.addEventListener("DOMContentLoaded", () => {
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

  serviceCards.forEach((card) => {
    observer.observe(card);
  });

  // Reviews functionality
  // --- Load reviews from localStorage ---
  let storedReviews = JSON.parse(localStorage.getItem('reviews')) || [];

  // Normalize property names (review/comments → comment)
  storedReviews = storedReviews.map(r => {
    if (r.comments && !r.comment) {
      r.comment = r.comments;
      delete r.comments;
    }
    if (r.review && !r.comment) {
      r.comment = r.review;
      delete r.review;
    }
    return r;
  });

  // Remove specific reviews by name
  const namesToRemove = ['Lydia Wandei', 'Emily Davis', 'Jennifer Lee', 'James Njoroge'];
  storedReviews = storedReviews.filter(r => !namesToRemove.includes(r.name));
  localStorage.setItem('reviews', JSON.stringify(storedReviews));

  // Merge reviews (now only stored reviews)
  let reviews = [...storedReviews];

  // --- Pagination + filter state ---
  const reviewsPerPage = 4;
  let currentPage = 1;
  let currentFilter = "all";

  // --- Notification system ---
  function showNotification(title, message, duration = 3000) {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.id = 'notificationContainer';
      notificationContainer.style.cssText = 'position: fixed; top: 100px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 15px;';
      document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = 'background: white; border-left: 4px solid #28a745; border-radius: 6px; padding: 15px 20px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); display: flex; align-items: center; gap: 15px; max-width: 350px; transform: translateX(400px); transition: transform 0.4s ease-out;';
    
    notification.innerHTML = `
      <div style="width: 30px; height: 30px; background: #28a745; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
        <i class="fas fa-check" style="color: white; font-size: 14px;"></i>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 5px; color: #28a745;">${title}</div>
        <div style="color: #666; font-size: 0.9rem;">${message}</div>
      </div>
      <button style="background: none; border: none; font-size: 1.2rem; color: #888; cursor: pointer; padding: 0; margin-left: 10px;">&times;</button>
    `;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('click', () => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    });
    
    if (duration > 0) {
      setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 400);
      }, duration);
    }
  }

  // --- Render reviews ---
  function displayReviews() {
    const reviewsList = document.getElementById("reviewsList");
    if (!reviewsList) return;

    reviewsList.innerHTML = "";

    // Filter
    let filteredReviews = reviews;
    if (currentFilter !== "all") {
      filteredReviews = reviews.filter(r => r.rating == currentFilter);
    }

    // Pagination
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const paginatedReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

    if (paginatedReviews.length === 0) {
      reviewsList.innerHTML = `<div class="no-reviews"><p>No reviews found.</p></div>`;
    } else {
      paginatedReviews.forEach(review => {
        const reviewDate = new Date(review.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
          starsHtml += `<i class="${i <= review.rating ? 'fas fa-star' : 'far fa-star'}"></i>`;
        }

        const div = document.createElement("div");
        div.className = "review-card";

        const reviewText = review.comment || "No comment provided";

        // Limit preview length to 200 characters
        let shortText = reviewText.length > 200 ? reviewText.slice(0, 200) + "..." : reviewText;

        div.innerHTML = `
          <div class="review-header">
            <span class="reviewer-name">${review.name}</span>
            <span class="review-date">${reviewDate}</span>
          </div>
          <div class="review-stars">${starsHtml}</div>
          <p class="review-text">${shortText}</p>
          ${reviewText.length > 200 ? '<button class="toggle-btn">Show More</button>' : ''}
        `;

        reviewsList.appendChild(div);

        // Add toggle functionality if needed
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

    updatePagination(totalPages);
  }

  // --- Update pagination controls ---
  function updatePagination(totalPages) {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    // Previous button
    if (currentPage > 1) {
      const prevBtn = document.createElement("button");
      prevBtn.className = "pagination-btn";
      prevBtn.innerHTML = "&laquo; Previous";
      prevBtn.addEventListener("click", () => {
        currentPage--;
        displayReviews();
      });
      paginationContainer.appendChild(prevBtn);

      // Add color with JS
      prevBtn.style.backgroundColor = "#007bff";
      prevBtn.style.color = "#fff";
      prevBtn.style.borderRadius = "5px";
      prevBtn.style.padding = "6px 12px";
      prevBtn.style.marginRight = "5px";

      // Hover effect
      prevBtn.addEventListener("mouseover", () => {
        prevBtn.style.backgroundColor = "#033e7eff";
      });

      prevBtn.addEventListener("mouseout", () => {
        prevBtn.style.backgroundColor = "#007bff";
      });
    }

    // Page numbers
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

      // Style for inactive buttons
  pageBtn.style.backgroundColor = "#f8f9fa";
  pageBtn.style.color = "#000000ff";
  pageBtn.style.border = "1px solid #dee2e6";
  pageBtn.style.borderRadius = "5px";
  pageBtn.style.padding = "6px 12px";
  pageBtn.style.margin = "0 2px";
  pageBtn.style.cursor = "pointer";
  pageBtn.style.transition = "all 0.3s ease";
  
  // Hover effect for inactive buttons
  pageBtn.addEventListener("mouseover", () => {
    if (i !== currentPage) {
      pageBtn.style.backgroundColor = "#cfcfd1ff";
    }
  });
  
  pageBtn.addEventListener("mouseout", () => {
    if (i !== currentPage) {
      pageBtn.style.backgroundColor = "#f8f9fa";
    }
  });
      
      // Style for active button
  if (i === currentPage) {
    pageBtn.style.backgroundColor = "#cfcfd1ff";
    pageBtn.style.color = "#000000";
    pageBtn.style.fontWeight = "bold";
  }
      
      paginationContainer.appendChild(pageBtn);
    }

    // Next button
    if (currentPage < totalPages) {
      const nextBtn = document.createElement("button");
      nextBtn.className = "pagination-btn";
      nextBtn.innerHTML = "Next &raquo;";
      nextBtn.addEventListener("click", () => {
        currentPage++;
        displayReviews();
      });
      paginationContainer.appendChild(nextBtn);

      // Add styles with JS
      nextBtn.style.backgroundColor = "#28a745";
      nextBtn.style.color = "#fff";
      nextBtn.style.borderRadius = "5px";
      nextBtn.style.padding = "6px 12px";
      nextBtn.style.marginLeft = "5px";

      // Hover effect
      nextBtn.addEventListener("mouseover", () => {
        nextBtn.style.backgroundColor = "#0d6421ff";
      });

      nextBtn.addEventListener("mouseout", () => {
        nextBtn.style.backgroundColor = "#28a745";
      });
    }
  }

  // --- Form submission ---
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const rating = parseInt(document.querySelector('input[name="rating"]:checked')?.value);
      const comment = document.getElementById("review").value.trim();

      if (!name || !rating) {
        showNotification('Error', 'Please fill in all required fields.', 3000);
        return;
      }

      const newReview = {
        id: Date.now(),
        name,
        rating,
        comment,
        date: new Date().toISOString().split("T")[0]
      };

      // Add to stored reviews and update localStorage
      storedReviews.unshift(newReview);
      localStorage.setItem("reviews", JSON.stringify(storedReviews));

      // Update the reviews array with the latest stored reviews
      reviews = [...storedReviews];
      currentPage = 1;
      currentFilter = "all";
      
      // Reset filter buttons
      document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
      });
      document.querySelector('[data-filter="all"]').classList.add("active");
      
      // Update the display
      displayReviews();
      reviewForm.reset();
      
      // Show success notification
      showNotification('Thank You!', 'Your review has been submitted successfully.', 4000);
    });
  }

  // --- Filter buttons ---
  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");

      currentFilter = this.getAttribute("data-filter");
      currentPage = 1;
      displayReviews();
    });
  });

  // --- Initial render ---
  displayReviews();

   const form = document.getElementById('serviceForm');
            
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Simple form validation
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const service = document.getElementById('service').value;
                
                if (name && email && service) {
                    // Here you would normally send the form data to a server
                    alert('Thank you for your service request! We will contact you shortly.');
                    form.reset();
                } else {
                    alert('Please fill in all required fields.');
                }
            });

            const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");

  // Animate hamburger into X
  hamburger.classList.toggle("open");
});

});

