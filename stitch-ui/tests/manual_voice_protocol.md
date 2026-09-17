# UPHAR VOICE SHOPPING ASSISTANT — MANUAL VOICE ACCEPTANCE PROTOCOL

This document defines the structured acoustic and user-acceptance testing protocol for human verification of the **Uphar Voice Shopping Assistant** in real browser environments.

---

## 1. Prerequisites & Environment Setup

- **Supported Browsers:**
  - Google Chrome (Desktop / Android)
  - Apple Safari (iOS 16+ / macOS)
  - Microsoft Edge (Chromium)
- **Audio Hardware:**
  - Functional microphone with OS permissions granted.
  - Output speakers/headphones configured at audible volume.
- **Network Environment:**
  - Active internet connection (required by browser Speech-to-Text cloud models).
- **Storefront Setup:**
  - Local Vite dev server (`npm run dev` at `http://localhost:3000`) or deployed Netlify staging environment.

---

## 2. Test Execution Matrix

| Test ID | Spoken Utterance | Target Language / Accent | Expected Voice Assistant Action | Verification Criteria |
|---|---|---|---|---|
| **M-01** | *"Kajal"* | Indian English | Displays Kajal products in chat drawer. Speaks summary. | **No route navigation.** Candidate cards appear with name and price. |
| **M-02** | *"Kajal dikhao"* | Hinglish | Displays Kajal candidates in drawer. | **No route navigation.** Speaks Hindi/Hinglish summary. |
| **M-03** | *"VLCC Kajal"* | Indian English | Identifies VLCC Kajal, shows product card. | **No route navigation.** Speaks price and details. |
| **M-04** | *"VLCC Kajal dikhao"* | Hinglish | Identifies VLCC Kajal, shows card in drawer. | **No route navigation.** Card has "View" button. |
| **M-05** | *"VLCC Kajal ka page kholo"* | Hinglish / Hindi | **Navigates browser URL to `/product/:id`.** | URL changes to `/product/:id`. Assistant stays mounted and speaks. |
| **M-06** | *"VLCC wala"* | Hinglish | Selects VLCC Kajal from active candidate list. | Focuses VLCC Kajal as active product. Speaks price. |
| **M-07** | *"VLCC wala khol do"* | Hinglish | **Navigates to `/product/:id`.** | URL changes to `/product/:id`. Assistant speaks page opening message. |
| **M-08** | *"Isko dikhao"* | Hindi / Hinglish | **Navigates to `/product/:id`.** | Directly navigates to active focused product. |
| **M-09** | *"Isko open karo"* | Hindi / Hinglish | **Navigates to `/product/:id`.** | Directly navigates to active focused product. |
| **M-10** | *"Iska price kya hai?"* | Hindi / Hinglish | Speaks price and discount percentage. | Correct ₹ amount and % discount spoken aloud. |
| **M-11** | *"Iske details batao"* | Hindi / Hinglish | Speaks product description and attributes. | **Strict rule:** Only product description/benefits spoken; NO return policy. |
| **M-12** | *"Lakme Kajal ka price?"* | Hinglish | **No collision:** Identifies Lakme is uncarried. | States Lakme is not in catalog; recommends Mamaearth and VLCC. |
| **M-13** | *"VLCC Kajal available hai?"* | Hinglish | Checks stock and confirms availability. | Speaks stock status accurately based on inventory. |
| **M-14** | *"Show me the first Kajal"* | Indian English | Selects candidate item 1 (index 0). | Selects first candidate card; displays price. |
| **M-15** | *"Show me one Kajal"* | Indian English | Category search for Kajal. | **Not treated as ordinal:** displays Kajal candidate list. |
| **M-16** | *"Second one"* | English / Hinglish | Selects candidate item 2 (index 1). | Selects second candidate card; sets active product. |
| **M-17** | *"Cart mein daal do"* | Hinglish | Prompts two-step confirmation. | Speaks price and asks for confirmation. Displays "Yes, Add to Cart" / "Cancel" buttons. |
| **M-18** | *"Haan daal do"* | Hindi / Hinglish | Commits product to cart. | Cart badge count increments by 1. Item appears in cart drawer. |
| **M-19** | *"Aur dikhao"* | Hindi / Hinglish | Advances pagination window by 3 items. | New candidate cards appended or displayed; speaks next batch. |
| **M-20** | *"Cancel"* | English / Hindi | Cancels active pending cart action. | Pending confirmation cleared; speaks cancellation message. |

---

## 3. Acoustic Quality & Ergonomics Checklist

- [ ] **Speech Synthesis Intelligibility:** Spoken audio is clear, correctly pitched, and accents pronunciation of Hindi words properly.
- [ ] **Barge-In / Interruption:** Tapping "Interrupt & Speak" immediately silences speech synthesis and activates microphone.
- [ ] **Instant Modal Opening:** Clicking the microphone FAB opens the drawer with zero perceptual lag.
- [ ] **Microphone Permission Handling:** Clear, polite banner displayed if microphone permission is denied in browser.
- [ ] **Text Fallback:** In environments without speech synthesis or Web Speech API, assistant fallback input remains fully functional.
