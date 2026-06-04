// --- Default Catalog Database using User's Uploaded Images ---
const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "Lumina Solitaire Diamond Ring",
    price: 4500,
    category: "Rings",
    description: "A brilliant solitaire diamond set in an elegant 18k white gold band. A timeless statement of love.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug.png",
    keywords: "ring, solitaire, diamond, engagement",
    highlighted: true
  },
  {
    id: "prod-2",
    name: "Aura Pearl Drop Earrings",
    price: 850,
    category: "Earrings",
    description: "Lustrous South Sea pearls hanging gracefully from delicate 18k rose gold hooks.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug (1).png",
    keywords: "earrings, pearl, pearls, drop",
    highlighted: true
  },
  {
    id: "prod-3",
    name: "Eternity Diamond Tennis Bracelet",
    price: 3200,
    category: "Bracelets",
    description: "A continuous line of individually set brilliant-cut diamonds in sleek platinum.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug (2).png",
    keywords: "bracelet, tennis, diamond bracelet, platinum",
    highlighted: false
  },
  {
    id: "prod-4",
    name: "Celestial Gold Pendant Necklace",
    price: 1250,
    category: "Necklaces",
    description: "A delicate 18k yellow gold chain featuring a sparkling celestial diamond pendant.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug (3).png",
    keywords: "necklace, gold, pendant, celestial",
    highlighted: true
  },
  {
    id: "prod-5",
    name: "Opulent Sapphire Halo Ring",
    price: 5200,
    category: "Rings",
    description: "A deep blue oval cut sapphire surrounded by a halo of brilliant micro-diamonds.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug (4).png",
    keywords: "sapphire, sapphire ring, halo, blue",
    highlighted: false
  },
  {
    id: "prod-6",
    name: "Cascade Chandelier Earrings",
    price: 2800,
    category: "Earrings",
    description: "Cascading tiers of round and marquise diamonds set in fine platinum.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug (5).png",
    keywords: "chandelier, earrings, chandelier earrings, luxury earrings",
    highlighted: false
  },
  {
    id: "prod-7",
    name: "Minimalist Gold Bangle",
    price: 950,
    category: "Bracelets",
    description: "A sleek, modern bangle handcrafted in solid, polished 18k yellow gold.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug (6).png",
    keywords: "bangle, bracelet, gold bangle, solid gold",
    highlighted: false
  },
  {
    id: "prod-8",
    name: "Elysian Emerald Pendant",
    price: 3400,
    category: "Necklaces",
    description: "A vibrant cushion-cut Colombian emerald pendant suspended on a platinum chain.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug (7).png",
    keywords: "emerald, emerald necklace, green, cushion cut",
    highlighted: false
  },
  {
    id: "prod-9",
    name: "Classic Gold Hoop Earrings",
    price: 650,
    category: "Earrings",
    description: "Classic polished yellow gold hoop earrings, a versatile everyday luxury essential.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug (8).png",
    keywords: "hoops, gold hoops, hoop earrings, hoops",
    highlighted: false
  },
  {
    id: "prod-10",
    name: "Amore Rose Gold Band",
    price: 1100,
    category: "Rings",
    description: "A softly curved, elegant band in polished 18k rose gold, perfect for layering.",
    image: "images/Gemini_Generated_Image_qiugelqiugelqiug (9).png",
    keywords: "band, rose gold, ring, gold band",
    highlighted: false
  }
];

// --- Application State ---
let products = [];
let cart = [];
let activeDiscount = 0; // percentage, e.g. 15 for 15%
let activeDiscountCode = "";
let editingProductId = null;

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
  initProducts();
  initCart();
  renderAll();
  setupEventListeners();
  setupSalesforceListeners();
});

// --- Catalog Database Operations (CRUD) ---
function initProducts() {
  const stored = localStorage.getItem("lumina_products");
  let needsReset = false;
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Force reset if the catalog doesn't contain exactly 10 products or doesn't have the uploaded Gemini images
      if (!Array.isArray(parsed) || parsed.length !== 10 || !parsed[0].image.includes("Gemini_Generated")) {
        needsReset = true;
      } else {
        products = parsed;
      }
    } catch (e) {
      console.error("Error parsing stored products, resetting to defaults", e);
      needsReset = true;
    }
  } else {
    needsReset = true;
  }

  if (needsReset) {
    products = [...DEFAULT_PRODUCTS];
    localStorage.setItem("lumina_products", JSON.stringify(products));
  }
}

window.resetCatalogToDefaults = function() {
  if (confirm("This will clear any changes you made and restore the 10 default products with your images. Proceed?")) {
    products = [...DEFAULT_PRODUCTS];
    saveProducts();
    showToast("Catalog reset to 10 default products!", "success");
    clearAdminForm();
  }
};

function saveProducts() {
  localStorage.setItem("lumina_products", JSON.stringify(products));
  renderAll();
}

function addProduct(productData) {
  const newProduct = {
    id: "prod-" + Date.now(),
    name: productData.name,
    price: parseFloat(productData.price) || 0,
    category: productData.category,
    description: productData.description || "",
    image: productData.image || "",
    keywords: productData.keywords || "",
    highlighted: !!productData.highlighted
  };
  products.push(newProduct);
  saveProducts();
  showToast(`Added Product: ${newProduct.name}`, "success");
}

function updateProduct(id, productData) {
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = {
      ...products[idx],
      name: productData.name,
      price: parseFloat(productData.price) || 0,
      category: productData.category,
      description: productData.description || "",
      image: productData.image || "",
      keywords: productData.keywords || "",
      highlighted: !!productData.highlighted
    };
    saveProducts();
    showToast(`Updated Product: ${productData.name}`, "success");
  }
}

function deleteProduct(id) {
  const p = products.find(p => p.id === id);
  if (p) {
    products = products.filter(prod => prod.id !== id);
    // Also remove from cart if present
    removeFromCart(id);
    saveProducts();
    showToast(`Deleted Product: ${p.name}`);
  }
}

// --- Cart Operations ---
function initCart() {
  const stored = localStorage.getItem("lumina_cart");
  if (stored) {
    try {
      cart = JSON.parse(stored);
      updateCartCount();
    } catch (e) {
      cart = [];
    }
  }
}

function saveCart() {
  localStorage.setItem("lumina_cart", JSON.stringify(cart));
  updateCartCount();
  renderCartDrawer();
}

function addToCart(productId, quantity = 1, silent = false) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const cartItem = cart.find(item => item.productId === productId);
  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cart.push({
      productId: productId,
      quantity: quantity
    });
  }
  saveCart();
  
  if (!silent) {
    showToast(`Added ${product.name} to Cart`, "success");
    openCart();
    // Animate cart badge
    const badge = document.querySelector(".cart-count");
    if (badge) {
      badge.classList.remove("cart-bounce");
      void badge.offsetWidth; // trigger reflow
      badge.classList.add("cart-bounce");
    }
  }
}

function changeQty(productId, change) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
  }
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.productId !== productId);
  saveCart();
}

function updateCartCount() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const badge = document.querySelector(".cart-count");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

function applyPromoCode(code) {
  const normalized = code.trim().toUpperCase();
  if (normalized === "WELCOME15" || normalized === "AGENT15") {
    activeDiscount = 15;
    activeDiscountCode = normalized;
    saveCart();
    showToast(`15% Discount Applied! (${normalized})`, "success");
    return true;
  } else {
    showToast("Invalid Promo Code", "error");
    return false;
  }
}

function removePromoCode() {
  activeDiscount = 0;
  activeDiscountCode = "";
  saveCart();
  showToast("Promo Code Removed");
}

// --- UI Render Engines ---
function renderAll() {
  renderCarousel();
  renderHighlights();
  renderAdminList();
  renderCartDrawer();
}

function getProductImageHTML(imagePath, nameInitials) {
  // If the path exists and is not empty, use the image.
  // We'll also handle fallbacks if the image fails to load.
  if (imagePath && imagePath.trim() !== "") {
    return `<img src="${imagePath}" alt="Jewelry Item" class="card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="card-img-fallback" style="display:none;">
              <div class="fallback-icon">✦</div>
              <div class="fallback-initials">${nameInitials}</div>
              <div style="font-size: 0.7rem; text-transform: uppercase; opacity: 0.7;">Lumina Fine</div>
            </div>`;
  } else {
    // If no path is provided, show premium CSS fallback directly
    return `<div class="card-img-fallback">
              <div class="fallback-icon">✦</div>
              <div class="fallback-initials">${nameInitials}</div>
              <div style="font-size: 0.7rem; text-transform: uppercase; opacity: 0.7;">Lumina Fine</div>
            </div>`;
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map(word => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function renderCarousel() {
  const container = document.getElementById("carouselContainer");
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `<div class="cart-empty-message" style="width: 100%;">No products in catalog. Open the Admin Panel to add some!</div>`;
    return;
  }

  container.innerHTML = products.map(product => {
    const initials = getInitials(product.name);
    const imgHTML = getProductImageHTML(product.image, initials);
    
    return `
      <div class="product-card" id="card-${product.id}" data-id="${product.id}">
        <div class="card-img-wrapper">
          ${product.highlighted ? '<span class="card-badge">Highlight</span>' : ''}
          ${imgHTML}
        </div>
        <div class="card-content">
          <div class="card-category">${product.category}</div>
          <h3 class="card-title">${product.name}</h3>
          <p class="card-desc">${product.description}</p>
          <div class="card-footer">
            <span class="card-price">$${product.price.toLocaleString()}</span>
            <button class="btn-add-cart" onclick="addToCart('${product.id}')" title="Add to Cart">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderHighlights() {
  const grid = document.getElementById("highlightGrid");
  if (!grid) return;

  const highlightedProducts = products.filter(p => p.highlighted);
  
  if (highlightedProducts.length === 0) {
    grid.innerHTML = `<div class="cart-empty-message" style="grid-column: 1/-1;">No highlighted products selected. Edit products in the Admin Panel to highlight them here!</div>`;
    return;
  }

  grid.innerHTML = highlightedProducts.map(product => {
    const initials = getInitials(product.name);
    const imgHTML = getProductImageHTML(product.image, initials);
    
    return `
      <div class="highlight-item" id="highlight-${product.id}">
        <div class="highlight-img-wrapper">
          ${imgHTML}
        </div>
        <div class="highlight-info">
          <div class="card-category">${product.category}</div>
          <h3 class="highlight-title">${product.name}</h3>
          <p class="highlight-desc">${product.description}</p>
          <div class="card-footer">
            <span class="card-price" style="font-size:1.2rem;">$${product.price.toLocaleString()}</span>
            <button class="btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderCartDrawer() {
  const container = document.getElementById("cartItems");
  const subtotalVal = document.getElementById("cartSubtotal");
  const discountVal = document.getElementById("cartDiscount");
  const discountRow = document.getElementById("cartDiscountRow");
  const totalVal = document.getElementById("cartTotal");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty-message">Your shopping bag is empty.</div>`;
    subtotalVal.textContent = "$0";
    discountRow.style.display = "none";
    totalVal.textContent = "$0";
    return;
  }

  let subtotal = 0;

  container.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return "";

    subtotal += product.price * item.quantity;
    const initials = getInitials(product.name);

    return `
      <div class="cart-item">
        <div style="position:relative; width:70px; height:70px;">
          <img src="${product.image}" alt="${product.name}" class="cart-item-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="card-img-fallback" style="display:none; font-size:0.6rem; padding:0.2rem; border-radius:4px;">
            <div class="fallback-initials" style="font-size:1.2rem; margin-bottom:0;">${initials}</div>
          </div>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${product.name}</div>
          <div class="cart-item-price">$${product.price.toLocaleString()}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty('${product.id}', -1)">-</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty('${product.id}', 1)">+</button>
          </div>
        </div>
        <div>
          <button class="cart-item-remove" onclick="removeFromCart('${product.id}')">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  // Totals calculations
  let discount = 0;
  if (activeDiscount > 0) {
    discount = subtotal * (activeDiscount / 100);
    discountRow.style.display = "flex";
    discountVal.textContent = `-$${discount.toLocaleString()} (${activeDiscountCode})`;
  } else {
    discountRow.style.display = "none";
  }

  const total = subtotal - discount;

  subtotalVal.textContent = `$${subtotal.toLocaleString()}`;
  totalVal.textContent = `$${total.toLocaleString()}`;
}

function renderAdminList() {
  const container = document.getElementById("adminProdList");
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `<div class="cart-empty-message">No products catalogued. Use the form to build a catalog.</div>`;
    return;
  }

  container.innerHTML = products.map(p => {
    return `
      <div class="admin-prod-item">
        <div style="position:relative; width:45px; height:45px;">
          <img src="${p.image}" class="admin-prod-thumb" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="card-img-fallback" style="display:none; font-size:0.4rem; padding:0; border-radius:4px;">
            <div class="fallback-initials" style="font-size:0.8rem; margin-bottom:0;">${getInitials(p.name)}</div>
          </div>
        </div>
        <div class="admin-prod-info">
          <div class="admin-prod-title">${p.name}</div>
          <div class="admin-prod-price">$${p.price.toLocaleString()} | ${p.category}</div>
        </div>
        <div class="admin-prod-actions">
          <button class="btn-action-small edit" onclick="startEditProduct('${p.id}')">Edit</button>
          <button class="btn-action-small delete" onclick="handleDeleteProduct('${p.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

// --- Admin Panel Actions ---
window.startEditProduct = function(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  editingProductId = id;
  document.getElementById("adminModalTitle").textContent = "Edit Product Details";
  document.getElementById("prodName").value = p.name;
  document.getElementById("prodPrice").value = p.price;
  document.getElementById("prodCategory").value = p.category;
  document.getElementById("prodDescription").value = p.description;
  document.getElementById("prodImage").value = p.image;
  document.getElementById("prodKeywords").value = p.keywords;
  document.getElementById("prodHighlight").checked = p.highlighted;
  
  document.getElementById("btnAdminSubmit").textContent = "Save Changes";
};

function clearAdminForm() {
  editingProductId = null;
  document.getElementById("adminModalTitle").textContent = "Add New Jewelry Product";
  document.getElementById("adminProductForm").reset();
  document.getElementById("btnAdminSubmit").textContent = "Add to Catalog";
}

window.handleDeleteProduct = function(id) {
  if (confirm("Are you sure you want to remove this item from the catalog?")) {
    deleteProduct(id);
    if (editingProductId === id) {
      clearAdminForm();
    }
  }
};

// --- Salesforce Chat Client Listeners (Agentforce) ---
function setupSalesforceListeners() {
  // Listen for the modern "Messaging for In-App and Web" event
  window.addEventListener("onEmbeddedMessageSent", (event) => {
    console.log("Salesforce Message Event: ", event.detail);
    const entry = event.detail?.conversationEntry;
    
    // Check if the sender is the Agent/Bot
    if (entry && entry.sender && entry.sender.role === 'Agent') {
      let messageText = "";
      if (entry.entryPayload) {
        try {
          const payload = typeof entry.entryPayload === 'string' ? JSON.parse(entry.entryPayload) : entry.entryPayload;
          if (payload.abstractMessage && payload.abstractMessage.staticContent) {
            messageText = payload.abstractMessage.staticContent.text;
          }
        } catch (e) {
          console.error("Failed to parse Agentforce payload text:", e);
        }
      }
      
      if (messageText) {
        console.log("Agentforce sent message text: ", messageText);
        handleAgentMessage(messageText, "Salesforce Agentforce");
      }
    }
  });

  // Setup legacy Live Agent handler check
  // We check window.embedded_svc because developers add handlers before init.
  // We'll hook into embedded_svc.addEventHandler once embedded_svc is loaded.
  const checkLegacyInterval = setInterval(() => {
    if (window.embedded_svc && typeof window.embedded_svc.addEventHandler === 'function') {
      clearInterval(checkLegacyInterval);
      console.log("Salesforce Legacy Chat SDK detected. Registering event handlers...");
      
      window.embedded_svc.addEventHandler("onAgentMessage", function(data) {
        console.log("Legacy Chat Agent Message Event: ", data);
        const text = data.messageText || data.text || "";
        if (text) {
          handleAgentMessage(text, "Legacy Salesforce Chat");
        }
      });
    }
  }, 1000);
  
  // Timeout interval check after 10s to avoid leaking resources
  setTimeout(() => clearInterval(checkLegacyInterval), 10000);
}

// --- Natural Language Message Action Parser (NLP Engine) ---
function handleAgentMessage(messageText, sourceName = "Simulated Agent") {
  const text = messageText.toLowerCase();
  console.log(`[Parser] Running NLP on message: "${messageText}" from ${sourceName}`);

  // Display message in the developer/simulator panel status block
  const statusBox = document.getElementById("simFeedback");
  const statusMsg = document.getElementById("simFeedbackMsg");
  if (statusBox && statusMsg) {
    statusBox.style.display = "block";
    statusMsg.textContent = `"${messageText}"`;
  }

  // Action variables
  let actionTaken = false;
  let actionDetails = [];

  // 1. Check for product keyword highlights
  products.forEach(p => {
    if (p.keywords) {
      // Split keywords by comma, trim, and check if any keyword is present in the agent message text
      const keywordsList = p.keywords.split(",").map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
      let matchedKeyword = null;

      for (let k of keywordsList) {
        // Matches exact words or phrases to avoid false positives (like 'ring' in 'spring')
        const regex = new RegExp(`\\b${k}\\b`);
        if (regex.test(text)) {
          matchedKeyword = k;
          break;
        }
      }

      if (matchedKeyword) {
        // Trigger product highlight!
        highlightProductInUI(p.id, p.name);
        actionTaken = true;
        actionDetails.push(`Highlighted: ${p.name}`);
      }
    }
  });

  // 2. Check for "Add to Cart" instructions
  // e.g. "I've added the Lumina Solitaire Ring to your cart" or "I'm adding the Pearl Drop Earrings to your bag"
  const isAddToCartIntent = text.includes("add") || text.includes("added") || text.includes("cart") || text.includes("bag");
  if (isAddToCartIntent) {
    products.forEach(p => {
      // Check if product name or specific identifier is mentioned in the message text
      const productNameLower = p.name.toLowerCase();
      // Also check short name identifiers
      const keywords = p.keywords.split(",").map(k => k.trim().toLowerCase());
      const isNameInText = text.includes(productNameLower) || keywords.some(k => k.length > 2 && text.includes(k));
      
      if (isNameInText) {
        addToCart(p.id, 1);
        actionTaken = true;
        actionDetails.push(`Added to Cart: ${p.name}`);
      }
    });
  }

  // 3. Check for promotional discounts
  // e.g. "Use code AGENT15 for a discount" or "I applied a coupon code for you"
  const isDiscountIntent = text.includes("discount") || text.includes("promo") || text.includes("coupon") || text.includes("code") || text.includes("percent");
  if (isDiscountIntent) {
    applyPromoCode("AGENT15");
    actionTaken = true;
    actionDetails.push("Applied 15% discount code: AGENT15");
  }

  // Feedback to developer console
  if (actionTaken) {
    console.log(`[Parser SUCCESS] Triggered website actions:`, actionDetails);
  } else {
    console.log(`[Parser INFO] No matching keywords or instructions detected in agent message.`);
  }
}

// UI Highlight Trigger
function highlightProductInUI(productId, productName) {
  // Find product card in the carousel
  const card = document.getElementById(`card-${productId}`);
  if (card) {
    // 1. Scroll item into view smoothly in the carousel
    card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    
    // 2. Add visual golden highlight class
    card.classList.add("agent-highlighted");
    
    // 3. Create toast notification
    showToast(`Agent suggested: ${productName}`, "success");
    
    // 4. Remove highlight after 5 seconds
    setTimeout(() => {
      card.classList.remove("agent-highlighted");
    }, 5000);
  }
}

// --- Event Listeners and Bindings ---
function setupEventListeners() {
  // Cart toggle
  const cartBtn = document.getElementById("btnCart");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartClose = document.getElementById("cartClose");

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (cartClose) cartClose.addEventListener("click", closeCart);
  if (cartOverlay) {
    cartOverlay.addEventListener("click", (e) => {
      if (e.target === cartOverlay) closeCart();
    });
  }

  // Admin Panel modal toggles
  const adminOpen = document.getElementById("btnAdminOpen");
  const adminClose = document.getElementById("adminClose");
  const adminOverlay = document.getElementById("adminOverlay");
  const adminCancel = document.getElementById("btnAdminCancel");
  const adminReset = document.getElementById("btnAdminReset");

  if (adminOpen) adminOpen.addEventListener("click", openAdminModal);
  if (adminClose) adminClose.addEventListener("click", closeAdminModal);
  if (adminCancel) adminCancel.addEventListener("click", closeAdminModal);
  if (adminReset) {
    adminReset.addEventListener("click", () => {
      window.resetCatalogToDefaults();
    });
  }
  if (adminOverlay) {
    adminOverlay.addEventListener("click", (e) => {
      if (e.target === adminOverlay) closeAdminModal();
    });
  }

  // Admin form submission
  const adminForm = document.getElementById("adminProductForm");
  if (adminForm) {
    adminForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const productData = {
        name: document.getElementById("prodName").value.trim(),
        price: parseFloat(document.getElementById("prodPrice").value) || 0,
        category: document.getElementById("prodCategory").value,
        description: document.getElementById("prodDescription").value.trim(),
        image: document.getElementById("prodImage").value.trim(),
        keywords: document.getElementById("prodKeywords").value.trim(),
        highlighted: document.getElementById("prodHighlight").checked
      };

      if (!productData.name) {
        showToast("Product Name is required", "error");
        return;
      }

      if (editingProductId) {
        updateProduct(editingProductId, productData);
      } else {
        addProduct(productData);
      }

      closeAdminModal();
    });
  }

  // Cart Promo Code submission
  const btnApplyPromo = document.getElementById("btnApplyPromo");
  const promoInput = document.getElementById("promoInput");
  if (btnApplyPromo && promoInput) {
    btnApplyPromo.addEventListener("click", () => {
      const code = promoInput.value;
      if (code) {
        if (applyPromoCode(code)) {
          promoInput.value = "";
        }
      }
    });
  }

  // Simulator Collapsible toggle
  const simHeader = document.getElementById("simHeader");
  const simDock = document.getElementById("simDock");
  if (simHeader && simDock) {
    simHeader.addEventListener("click", () => {
      simDock.classList.toggle("collapsed");
    });
  }

  // Simulator Presets
  const presetButtons = document.querySelectorAll(".btn-sim-preset");
  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const msg = btn.getAttribute("data-msg");
      if (msg) {
        handleAgentMessage(msg, "Simulator Preset");
      }
    });
  });

  // Simulator Custom Input Send
  const btnSimSend = document.getElementById("btnSimSend");
  const simInput = document.getElementById("simInput");
  if (btnSimSend && simInput) {
    btnSimSend.addEventListener("click", sendCustomSimMessage);
    simInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendCustomSimMessage();
      }
    });
  }

  // Carousel scroll buttons
  const btnPrev = document.getElementById("carouselPrev");
  const btnNext = document.getElementById("carouselNext");
  const carousel = document.getElementById("carouselContainer");
  
  if (btnPrev && carousel) {
    btnPrev.addEventListener("click", () => {
      carousel.scrollBy({ left: -320, behavior: "smooth" });
    });
  }
  if (btnNext && carousel) {
    btnNext.addEventListener("click", () => {
      carousel.scrollBy({ left: 320, behavior: "smooth" });
    });
  }
}

function sendCustomSimMessage() {
  const simInput = document.getElementById("simInput");
  if (!simInput) return;

  const msg = simInput.value.trim();
  if (msg) {
    handleAgentMessage(msg, "Simulator Custom Input");
    simInput.value = "";
  }
}

// Modal Toggle Helpers
function openCart() {
  document.getElementById("cartOverlay")?.classList.add("active");
}
function closeCart() {
  document.getElementById("cartOverlay")?.classList.remove("active");
}

function openAdminModal() {
  clearAdminForm();
  document.getElementById("adminOverlay")?.classList.add("active");
}
function closeAdminModal() {
  document.getElementById("adminOverlay")?.classList.remove("active");
}

// --- Toast System ---
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="font-size:1.1rem;">${type === 'success' ? '✦' : '✧'}</div>
    <div class="toast-msg">${message}</div>
  `;

  container.appendChild(toast);

  // Automatically fade out and remove toast after 3.5s
  setTimeout(() => {
    toast.style.transform = "translateX(120%)";
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}
