
-- Harden functions: set search_path and restrict execute
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Seed categories
INSERT INTO public.categories (slug, name, description, sort_order) VALUES
  ('rings','Rings','Engagement, daily wear, diamond, gemstone',1),
  ('earrings','Earrings','Studs, drops, hoops',2),
  ('bracelets-bangles','Bracelets & Bangles','Modern bangles and bracelets',3),
  ('solitaires','Solitaires','Certified solitaire diamonds',4),
  ('mangalsutras','Mangalsutras','Traditional and modern',5),
  ('necklaces-pendants','Necklaces & Pendants','Pendants, chains, necklaces',6),
  ('silver-jewellery','Silver Jewellery','Sterling silver collection',7),
  ('gifting','Gifting','Curated jewellery gifts',8);

-- Seed collections
INSERT INTO public.collections (slug, name, description, is_featured, sort_order) VALUES
  ('bridal','Bridal Edit','Heirloom-worthy pieces for your wedding day',true,1),
  ('everyday-luxe','Everyday Luxe','Modern minimal diamonds for daily wear',true,2),
  ('festive','Festive Glow','Statement gold for the season of celebrations',true,3),
  ('solitaire-stories','Solitaire Stories','Certified solitaires, perfectly set',true,4);

-- Seed stores
INSERT INTO public.store_locations (name, city, state, pincode, address, phone, hours) VALUES
  ('Pavitram Mumbai Flagship','Mumbai','Maharashtra','400050','Linking Road, Bandra West, Mumbai','+91 22 4000 1100','Mon-Sun: 11AM - 9PM'),
  ('Pavitram Delhi','New Delhi','Delhi','110001','Connaught Place, Block A, New Delhi','+91 11 4000 2200','Mon-Sun: 11AM - 9PM'),
  ('Pavitram Bengaluru','Bengaluru','Karnataka','560001','UB City, Vittal Mallya Road, Bengaluru','+91 80 4000 3300','Mon-Sun: 11AM - 9PM'),
  ('Pavitram Hyderabad','Hyderabad','Telangana','500081','Jubilee Hills Road No. 36','+91 40 4000 4400','Mon-Sun: 11AM - 9PM'),
  ('Pavitram Chennai','Chennai','Tamil Nadu','600018','Khader Nawaz Khan Road, Nungambakkam','+91 44 4000 5500','Mon-Sun: 11AM - 9PM'),
  ('Pavitram Kolkata','Kolkata','West Bengal','700017','Park Street, Kolkata','+91 33 4000 6600','Mon-Sun: 11AM - 9PM');

-- Seed banners
INSERT INTO public.banners (title, subtitle, image_url, cta_label, cta_url, placement, sort_order) VALUES
  ('The Bridal Edit','Heirloom diamonds, reimagined for the modern bride','/images/hero-bridal.jpg','Explore Collection','/collections/bridal','hero',1),
  ('Festive Glow','Statement gold for every celebration','/images/hero-festive.jpg','Shop Festive','/collections/festive','hero',2),
  ('FLAT 50% OFF on Making Charges','On all diamond jewellery this season',' ','Shop Now','/products','promo',1);

-- Seed products (10)
WITH cat AS (SELECT slug, id FROM public.categories), col AS (SELECT slug, id FROM public.collections)
INSERT INTO public.products
  (slug, sku, name, short_description, description, category_id, collection_id, metal_type, gold_purity, diamond_type, weight_grams, certification, occasion, style, original_price, offer_price, badge, rating, rating_count, is_featured, is_bestseller, is_new_arrival)
VALUES
  ('twist-diamond-pendant','PV-PEN-001','Twist Diamond Pendant','18KT Rose Gold · IJ-SI Certified','A delicate twist of rose gold cradles a brilliant diamond — quietly luxurious, endlessly wearable.',(SELECT id FROM cat WHERE slug='necklaces-pendants'),(SELECT id FROM col WHERE slug='everyday-luxe'),'Gold','18KT','IJ-SI',2.150,'BIS Hallmarked','Daily Wear','Modern',37200,29760,'20% OFF',4.8,120,true,true,false),
  ('floral-diamond-stud','PV-EAR-001','Floral Diamond Stud Earrings','18KT Yellow Gold','Six-petal floral studs scattered with brilliant-cut diamonds.',(SELECT id FROM cat WHERE slug='earrings'),(SELECT id FROM col WHERE slug='everyday-luxe'),'Gold','18KT','IJ-SI',3.400,'BIS Hallmarked','Daily Wear','Floral',48640,38912,'Bestseller',4.8,120,true,true,false),
  ('twist-diamond-ring','PV-RNG-001','Twist Diamond Ring','18KT Rose Gold','Sculpted band that loops around a row of pavé-set diamonds.',(SELECT id FROM cat WHERE slug='rings'),(SELECT id FROM col WHERE slug='everyday-luxe'),'Gold','18KT','IJ-SI',4.200,'BIS Hallmarked','Daily Wear','Contemporary',33179,26543,'New Arrival',4.9,98,true,false,true),
  ('classic-solitaire-pendant','PV-PEN-002','Classic Solitaire Pendant','18KT White Gold','A single solitaire in a halo of brilliance — the quiet showstopper.',(SELECT id FROM cat WHERE slug='solitaires'),(SELECT id FROM col WHERE slug='solitaire-stories'),'Gold','18KT','IJ-SI',1.900,'IGI Certified','Anniversary','Solitaire',37200,29760,'20% OFF',4.7,64,true,false,false),
  ('petal-diamond-drop','PV-EAR-002','Petal Diamond Drop Earrings','18KT Yellow Gold','Layered petals that catch light from every angle.',(SELECT id FROM cat WHERE slug='earrings'),(SELECT id FROM col WHERE slug='festive'),'Gold','18KT','IJ-SI',4.600,'BIS Hallmarked','Festive','Floral',52644,42115,'Limited Edition',4.9,86,true,false,true),
  ('heritage-mangalsutra','PV-MNG-001','Heritage Mangalsutra','22KT Yellow Gold','Traditional black-bead mangalsutra with a diamond-set pendant.',(SELECT id FROM cat WHERE slug='mangalsutras'),(SELECT id FROM col WHERE slug='bridal'),'Gold','22KT','IJ-SI',12.500,'BIS Hallmarked','Wedding','Traditional',128400,118600,'Bestseller',4.9,212,true,true,false),
  ('royal-temple-bangles','PV-BNG-001','Royal Temple Bangles (Pair)','22KT Yellow Gold','Hand-carved temple-motif bangles, sold as a pair.',(SELECT id FROM cat WHERE slug='bracelets-bangles'),(SELECT id FROM col WHERE slug='bridal'),'Gold','22KT',NULL,22.000,'BIS Hallmarked','Wedding','Traditional',186000,172800,NULL,4.8,54,false,false,false),
  ('silver-lotus-pendant','PV-PEN-003','Silver Lotus Pendant','Sterling 925 Silver','A serene lotus in oxidised sterling silver.',(SELECT id FROM cat WHERE slug='silver-jewellery'),NULL,'Silver',NULL,NULL,5.800,'BIS Hallmarked','Daily Wear','Contemporary',3499,2799,'20% OFF',4.6,38,false,false,true),
  ('eternal-band','PV-RNG-002','Eternal Diamond Band','18KT White Gold','Full-circle pavé diamond band — the modern eternity ring.',(SELECT id FROM cat WHERE slug='rings'),(SELECT id FROM col WHERE slug='solitaire-stories'),'Gold','18KT','IJ-SI',3.100,'IGI Certified','Anniversary','Eternity',86400,72900,'New Arrival',4.9,42,true,false,true),
  ('gift-set-mini-studs','PV-GFT-001','Mini Diamond Stud Gift Set','18KT Yellow Gold','Petite diamond studs presented in a Pavitram keepsake box.',(SELECT id FROM cat WHERE slug='gifting'),NULL,'Gold','18KT','IJ-SI',1.200,'BIS Hallmarked','Gifting','Minimal',18900,15120,'Bestseller',4.7,76,true,true,false);

-- Pages (CMS)
INSERT INTO public.pages (slug, title, body) VALUES
('privacy-policy','Privacy Policy', E'## Pavitram Privacy Policy\n\nLast updated: 1 January 2026.\n\nThis policy explains how Pavitram Diamond Jewellery ("we", "us") collects, uses and protects personal information collected through our website, mobile applications and retail stores.\n\n### 1. Information we collect\n- Identity & contact data: name, phone, email, billing and shipping addresses, GSTIN where provided.\n- Order & payment data: products purchased, payment status, invoices. Card details are processed by our PCI-compliant payment partners and never stored on our servers.\n- Account & preference data: wishlist, saved sizes, communication preferences.\n- Technical data: IP address, device, browser, cookies and similar identifiers.\n\n### 2. How we use it\nTo fulfil and deliver orders, provide customer support, send transactional messages, comply with Indian law (including GST and BIS requirements), prevent fraud, and (with your consent) send marketing.\n\n### 3. Sharing\nWith logistics, payment, KYC, communication and analytics partners under written contracts; with law-enforcement when legally required; and on a confidential basis during a corporate transaction.\n\n### 4. Your rights\nAccess, correction, deletion, withdrawal of consent and grievance redressal — write to privacy@pavitram.in.\n\n### 5. Retention\nWe retain personal data only as long as needed for the purposes above or as required by Indian law.\n\n### 6. Contact\nGrievance Officer: privacy@pavitram.in · Pavitram Diamond Jewellery, Bandra West, Mumbai 400050.'),
('terms','Terms & Conditions', E'## Terms & Conditions\n\nBy accessing pavitram.in you agree to these terms. All products are sold subject to availability, pricing accuracy, and our quality and certification standards.\n\n### 1. Eligibility\nYou must be at least 18 years old to place an order.\n\n### 2. Pricing\nPrices are in INR and include GST. Gold and diamond prices are dynamic and may change without notice prior to order confirmation.\n\n### 3. Orders\nAn order is confirmed only when payment is realised and an order number is issued. We reserve the right to cancel orders due to suspected fraud, stock issues or pricing errors with a full refund.\n\n### 4. Intellectual property\nAll content, images and designs are the property of Pavitram and protected by Indian copyright and trademark law.\n\n### 5. Jurisdiction\nThese terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts at Mumbai.'),
('shipping-policy','Shipping Policy', E'## Shipping Policy\n\n### Free, fully insured shipping across India\nAll orders ship free of cost via insured, signature-required courier.\n\n### Dispatch time\n- In-stock items: dispatched within 2 business days.\n- Made-to-order items: 10–15 business days.\n\n### Delivery time\nTypically 3–7 business days depending on PIN code.\n\n### Tracking\nA tracking link is emailed and SMSed once your order ships.\n\n### Identity verification\nFor security, our courier may verify government photo ID at delivery.'),
('returns-policy','Return, Refund & Exchange Policy', E'## Returns, Refunds & Exchange\n\n### 15-day returns\nReturn unworn, undamaged jewellery within 15 days of delivery with original packaging, certificate and invoice.\n\n### Lifetime exchange\nExchange your Pavitram jewellery for the prevailing value of gold and diamonds, less making and wastage as per our buyback grid.\n\n### Refund timelines\n- Prepaid orders: refunded to original payment method within 7 business days of QC clearance.\n- COD orders: refunded to a bank account you provide.\n\n### Non-returnable\nCustomised, engraved, or altered items are non-returnable except for manufacturing defects.'),
('cancellation-policy','Cancellation Policy', E'## Cancellation Policy\n\nYou may cancel an order any time before dispatch from your Pavitram account or by contacting care@pavitram.in. Made-to-order items can be cancelled within 24 hours of order placement. After dispatch, please use our returns process.'),
('cookie-policy','Cookie Policy', E'## Cookie Policy\n\nWe use cookies and similar technologies to keep you signed in, remember your preferences, secure your account, measure site performance and personalise recommendations. You can disable non-essential cookies from your browser settings. Essential cookies are required for the site to function.'),
('grievance-policy','Grievance Redressal', E'## Grievance Redressal\n\nIn accordance with the Information Technology Act, 2000 and the Consumer Protection Act, 2019, Pavitram has appointed a Grievance Officer.\n\n**Grievance Officer**\nName: Customer Care Head\nEmail: grievance@pavitram.in\nAddress: Pavitram Diamond Jewellery, Linking Road, Bandra West, Mumbai 400050\n\nWe acknowledge complaints within 48 hours and resolve them within 30 days.'),
('contact','Contact Us', E'## Get in touch\n\nWe would love to hear from you.\n\n- **Customer Care:** +91 1800 200 1990 (Mon–Sun, 9 AM – 9 PM)\n- **Email:** care@pavitram.in\n- **WhatsApp:** +91 98200 11990\n\nWalk into any Pavitram boutique for personal styling and try-at-home appointments.'),
('about','About Pavitram', E'## Crafted since 1990\n\nPavitram began in a single workshop in Mumbai in 1990 with a simple promise: every piece must feel as honest as it looks. Three decades on, we are an India-wide jeweller of certified diamonds and hallmarked gold — designed in-house, crafted by master karigars, and trusted by generations of families.\n\n### What we stand for\n- **Certified, always.** BIS-hallmarked gold. IGI / GIA-certified diamonds. Plain-language price breakdowns on every product.\n- **Ethical sourcing.** Conflict-free diamonds, recycled gold options, and full traceability.\n- **Made to last.** Lifetime exchange, free cleaning at all Pavitram boutiques, and a 15-day no-questions return policy.\n\nTimeless elegance. Crafted for you.'),
('faqs','Frequently Asked Questions', E'## FAQs\n\n**Is Pavitram jewellery certified?**\nYes — all gold is BIS hallmarked and all solitaires above 0.30ct carry an IGI or GIA certificate.\n\n**Do you offer EMI?**\nYes, no-cost EMI is available on most credit cards and select debit cards at checkout.\n\n**Can I customise a design?**\nAbsolutely. Book a design appointment at any boutique or write to design@pavitram.in.\n\n**What is your return policy?**\n15-day return on unworn pieces. Lifetime exchange on all Pavitram jewellery.\n\n**Do you ship internationally?**\nWe currently ship across India. International shipping is available on request.');

-- Product images (placeholder URLs from public.images store) and one default variant per product
INSERT INTO public.product_images (product_id, url, alt_text, sort_order, is_primary)
SELECT id, '/images/product-' || (row_number() OVER (ORDER BY created_at)) || '.jpg', name, 0, true
FROM public.products;

INSERT INTO public.product_variants (product_id, sku, size, metal_color, karat, stock_qty)
SELECT id, sku || '-DEF', NULL, 'Yellow Gold', gold_purity, 10 FROM public.products WHERE gold_purity IS NOT NULL;
