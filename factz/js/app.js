"use strict";

// DOM elements
const form = document.getElementById("factcheck-form");
const queryInput = document.getElementById("query");
const resultsDiv = document.getElementById("results");
const errorMsg = document.getElementById("error-msg");
const noResultsMsg = document.getElementById("no-results-msg");
const userQueryDiv = document.getElementById("user-query");
const clearBtn = document.getElementById("clear-btn");
const loadMoreBtn = document.getElementById("load-more-btn");
const submitBtn = document.getElementById("submit-btn");
const checkBtnLabel = document.getElementById("check-btn-label");

const paginationInfo = document.getElementById("pagination-info");
const currentPageSpan = document.getElementById("current-page");

const API_KEY = "YOUR_KEY";  // Replace with your real key
const API_BASE_URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search";

let nextPageToken = null;
let currentQuery = "";
let currentPage = 1;

// Disable right-click globally
document.addEventListener("contextmenu", e => e.preventDefault());

// Submit form handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = queryInput.value.trim();
  if (!query) return;

  currentQuery = query;
  nextPageToken = null; // reset pagination for new query
  currentPage = 1;      // reset page number

  resetUI();
  userQueryDiv.classList.remove("hidden");
  userQueryDiv.textContent = `Your query: "${query}"`;

  paginationInfo.classList.add("hidden"); // hide pagination initially

  await fetchClaims({ query, pageToken: null });
});

// Clear button handler
clearBtn.addEventListener("click", () => {
  queryInput.value = "";
  currentQuery = "";
  nextPageToken = null;
  currentPage = 1;
  resetUI();
  queryInput.focus();
  loadMoreBtn.classList.add("hidden");
  paginationInfo.classList.add("hidden");
});

// Load more button handler
loadMoreBtn.addEventListener("click", async () => {
  if (!nextPageToken) return;
  await fetchClaims({ query: currentQuery, pageToken: nextPageToken });
});

// Reset UI to initial state
function resetUI() {
  resultsDiv.innerHTML = "";
  errorMsg.classList.add("hidden");
  noResultsMsg.classList.add("hidden");
  userQueryDiv.classList.add("hidden");
  loadMoreBtn.classList.add("hidden");
  paginationInfo.classList.add("hidden");
  submitBtn.disabled = false;
  checkBtnLabel.textContent = "Check Claim";
}

// Fetch claims from Google Fact Check API
async function fetchClaims({ query, pageToken }) {
  try {
    submitBtn.disabled = true;
    checkBtnLabel.innerHTML = `<span class="spinner" aria-hidden="true"></span>Loading...`;
    errorMsg.classList.add("hidden");
    noResultsMsg.classList.add("hidden");

    const url = new URL(API_BASE_URL);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("query", query);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();

    if (!data.claims || data.claims.length === 0) {
      if (!pageToken) {
        noResultsMsg.classList.remove("hidden");
      }
      loadMoreBtn.classList.add("hidden");
      paginationInfo.classList.add("hidden");
      submitBtn.disabled = false;
      checkBtnLabel.textContent = "Check Claim";
      return;
    }

    if (!pageToken) {
      // New search: clear results & reset page display
      resultsDiv.innerHTML = "";
      currentPage = 1;
      updatePageDisplay();
      paginationInfo.classList.remove("hidden");
    } else {
      // Loading more results: increment page number
      currentPage++;
      updatePageDisplay();
    }

    renderResults(data.claims);

    // Setup pagination
    nextPageToken = data.nextPageToken || null;
    if (nextPageToken) {
      loadMoreBtn.classList.remove("hidden");
      loadMoreBtn.disabled = false;
      loadMoreBtn.focus(); // Accessibility: move focus
    } else {
      loadMoreBtn.classList.add("hidden");
    }
  } catch (error) {
    if (error.message.startsWith("HTTP error")) {
      errorMsg.textContent = `Network error: ${error.message}`;
    } else {
      errorMsg.textContent = `Error: ${error.message || "Unknown error"}`;
    }
    errorMsg.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    checkBtnLabel.textContent = "Check Claim";
  }
}

// Update page number display
function updatePageDisplay() {
  currentPageSpan.textContent = currentPage;
  paginationInfo.classList.remove("hidden");
}

// Render the list of claims
function renderResults(claims) {
  claims.forEach(claim => {
    const div = document.createElement("div");
    div.className = "fade-in p-4 border border-indigo-200 bg-white rounded shadow dark:bg-gray-800 dark:border-indigo-600";

    const text = document.createElement("p");
    text.className = "font-semibold text-indigo-900 mb-2 dark:text-indigo-300";
    text.textContent = claim.text || "No claim text";
    div.appendChild(text);

    if (claim.claimReview) {
      claim.claimReview.forEach(review => {
        const section = document.createElement("div");
        section.className = "mt-3 border-t pt-2 border-indigo-100 dark:border-indigo-700";

        const verdict = review.textualRating || "Unknown";
        const color =
          verdict.toLowerCase().includes("false") ? "text-red-600 font-bold" :
          verdict.toLowerCase().includes("true") ? "text-green-600 font-bold" :
          "text-yellow-600";

        section.innerHTML = `
          <p><strong>Publisher:</strong> ${sanitize(review.publisher?.name || "Unknown")}</p>
          <p><strong>Verdict:</strong> <span class="${color}">${sanitize(verdict)}</span></p>
          ${review.title ? `<p class="italic text-indigo-600 dark:text-indigo-300">${sanitize(review.title)}</p>` : ""}
          ${review.reviewDate ? `<p class="text-sm text-indigo-400 dark:text-indigo-500">Reviewed on: ${new Date(review.reviewDate).toLocaleDateString()}</p>` : ""}
          ${review.url ? `<a href="${sanitizeUrl(review.url)}" target="_blank" rel="noopener noreferrer" class="text-indigo-700 hover:underline dark:text-indigo-300">Read full review</a>` : ""}
        `;
        div.appendChild(section);
      });
    }

    resultsDiv.appendChild(div);
  });
}

// Sanitize inner text to avoid XSS
function sanitize(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Sanitize URLs to avoid XSS
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? url : "#";
  } catch {
    return "#";
  }
}
