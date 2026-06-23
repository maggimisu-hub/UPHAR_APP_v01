# Custom Agent Rules for Uphar App

## Password and Secret Masking Rule
- Under no circumstances should real password values or secrets be printed or logged in any outputs.
- Any password, api_key, token, or secret value must always be masked or redacted in logs, walkthroughs, reports, screenshots, or chat output.
- Always use masked formats like:
  - ADMIN_PASSWORD=*******
  - ADMIN_PASSWORD=[REDACTED]
- This rule applies to:
  - Browser automation reports
  - Walkthrough documentation (`walkthrough.md`)
  - Console and terminal outputs
  - Database queries and verification reports
  - Summaries or chat messages in the conversation

## Universal Product Upload Prompt & Execution Rules
When the user sends a command to upload products, follow these strict execution rules:
- **Admin UI Only**: Use the browser-automation system to execute uploads. Do not use direct Supabase writes as the primary upload method.
- **Dynamic Batch Folder System**:
  - Locate files strictly inside the provided batch directory: `D:\Antigravity\Uphar_App_v01\stitch-ui\upload_batches\YYYY-MM-DD_batch-XX`
  - Read product data from `<batch_folder>/products_to_upload.json`
  - Read product images from `<batch_folder>/images/`
  - Ignore older batch folders or top-level JSON data.
- **Pilot First**: Always execute and verify a pilot run (first product) before continuing with the rest of the batch.
- **Stock Management**: If the JSON defines stock levels (`stock` or `quantity`), navigate to the **Admin > Inventory** screen after creating the product, locate the variant row, input the stock level, and save it.
- **Final Output Format**:
  1. Batch folder used
  2. Pilot product used
  3. Pilot result
  4. Which products were uploaded
  5. Which images were used for each product
  6. Which stock quantities were set, if any
  7. Any failures and exact reason
  8. Confirmation whether the batch completed successfully

