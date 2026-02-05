if (typeof pdfjsLib !== 'undefined') { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; }
            if (typeof emailjs !== 'undefined') { emailjs.init("thg5rkoV_YE3VuWnU"); }
            let currentStep = 1; let options = { reliure: false, plastique: false };
            const prices = { "A5": { "NB": 200, "CL": 400 }, "A4": { "NB": 400, "CL": 700 }, "A3": { "NB": 1000, "CL": 1800 }, "A2": { "NB": 4500, "CL": 7500 }, "A1": { "NB": 9000, "CL": 15000 }, "A0": { "NB": 18000, "CL": 25000 } };
            const fileInput = document.getElementById('fileUpload');
            if (fileInput) {
                fileInput.addEventListener('change', async function(e) {
                    const file = e.target.files[0]; if (!file) return;
                    document.getElementById('previewBox').classList.remove('hidden'); document.getElementById('previewName').innerText = file.name;
                    const imgT = document.getElementById('imagePreview'), canT = document.getElementById('pdfPreview'); imgT.classList.add('hidden'); canT.classList.add('hidden');
                    if (file.type.startsWith('image/')) { const r = new FileReader(); r.onload = (e) => { imgT.src = e.target.result; imgT.classList.remove('hidden'); }; r.readAsDataURL(file); document.getElementById('nbPages').value = 1; }
                    else if (file.type === "application/pdf" && typeof pdfjsLib !== 'undefined') { const r = new FileReader(); r.onload = async function() { const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise; document.getElementById('nbPages').value = pdf.numPages; const page = await pdf.getPage(1); const vp = page.getViewport({ scale: 0.3 }); canT.height = vp.height; canT.width = vp.width; canT.classList.remove('hidden'); await page.render({canvasContext: canT.getContext('2d'), viewport: vp}).promise; calculatePrice(); }; r.readAsArrayBuffer(file); }
                    calculatePrice();
                });
            }
            function resetUpload() { document.getElementById('fileUpload').value = ""; document.getElementById('previewBox').classList.add('hidden'); calculatePrice(); }
            function toggleOption(opt) { options[opt] = !options[opt]; document.getElementById(`opt-${opt}`).classList.toggle('active'); calculatePrice(); }
            function toggleRectoVerso() {
                const val = document.getElementById('rectoVerso').value === "true"; document.getElementById('rectoVerso').value = !val; const btn = document.getElementById('btnRV');
                if(!val) btn.innerText = translations[localStorage.getItem('printbam-lang') || 'fr']?.term_recto_verso || "Recto / Verso"; else btn.innerText = translations[localStorage.getItem('printbam-lang') || 'fr']?.term_recto || "Recto Seul"; calculatePrice();
            }
            function calculatePrice() {
                const f = document.getElementById('format').value, c = document.getElementById('couleur').value, isV = document.getElementById('rectoVerso').value === "true", p = parseInt(document.getElementById('nbPages').value) || 1, e = parseInt(document.getElementById('nbExemplaires').value) ||1;
                let unitP = prices[f][c]; if(isV) unitP = Math.round(unitP * 1.6); const totalImp = unitP * p * e; let totalFin = 0; if(options.reliure) totalFin += 1500 * e; if(options.plastique) totalFin += (1000 * p) * e; const totalGlobal = totalImp + totalFin;
                const totalDisplay = document.getElementById('totalDisplay'); if(totalDisplay) totalDisplay.innerText = totalGlobal.toLocaleString('fr-FR');
                const resImpression = document.getElementById('resImpression'); if(resImpression) resImpression.innerText = `${f} ${c} (${p}p x ${e})`;
                const resFinition = document.getElementById('resFinition'); if(resFinition) resFinition.innerText = totalFin.toLocaleString('fr-FR') + " FC";
            }
            function handleNavigation() { if (currentStep < 3) nextStep(); else validateFinalProcess(); }
            function nextStep() {
                if (currentStep === 1 && !document.getElementById('fileUpload').files[0]) return showErrorAnimation(document.getElementById('uploadContainer'));
                if (currentStep === 2 && !['custName', 'custTel', 'custAddr'].every(id => document.getElementById(id).value.trim())) return;
                document.getElementById(`step-${currentStep}`).classList.add('hidden-step'); document.getElementById(`pill-${currentStep}`).className = "px-6 py-2 rounded-full text-[10px] font-black text-indigo-600/30"; currentStep++;
                document.getElementById(`step-${currentStep}`).classList.remove('hidden-step'); document.getElementById(`pill-${currentStep}`).className = "px-6 py-2 rounded-full text-[10px] font-black bg-indigo-600 text-white"; updateControls();
            }
            function prevStep() {
                document.getElementById(`step-${currentStep}`).classList.add('hidden-step'); document.getElementById(`pill-${currentStep}`).className = "px-6 py-2 rounded-full text-[10px] font-black text-indigo-600/30"; currentStep--;
                document.getElementById(`step-${currentStep}`).classList.remove('hidden-step'); document.getElementById(`pill-${currentStep}`).className = "px-6 py-2 rounded-full text-[10px] font-black bg-indigo-600 text-white"; updateControls();
            }
            function updateControls() {
                const prevBtn = document.getElementById('prevBtn'); const nextBtn = document.getElementById('nextBtn'); const lang = localStorage.getItem('printbam-lang') || 'fr';
                if(prevBtn) prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
                if(nextBtn) { if(currentStep === 3) nextBtn.innerText = translations[lang]?.term_confirm || "Confirmer le Paiement"; else nextBtn.innerText = translations[lang]?.term_continue || "Continuer"; }
            }
            function selectMethod(el, op) { document.querySelectorAll('.payment-btn').forEach(b => b.classList.add('grayscale', 'opacity-50')); el.classList.remove('grayscale', 'opacity-50'); el.classList.add('border-indigo-600', 'bg-indigo-600/10'); document.getElementById('selectedOperator').value = op; }
            async function validateFinalProcess() {
                const op = document.getElementById('selectedOperator').value; if (!op) return; let prog = 0; document.getElementById('uploadModal').classList.remove('hidden');
                const timer = setInterval(() => { if(prog < 90) { prog += 10; document.getElementById('progressBar').style.width = prog + "%"; document.getElementById('progressPercent').innerText = prog + "%"; } }, 400);
                try {
                    const url = await uploadToDrive(document.getElementById('fileUpload').files[0]); clearInterval(timer); document.getElementById('progressBar').style.width = "100%";
                    setTimeout(() => { document.getElementById('uploadModal').classList.add('hidden'); if (op === "Cashbam") finalizeOrder(url, "CASHBAM"); else startFlutterwave(url, op); }, 500);
                } catch (err) { clearInterval(timer); document.getElementById('uploadModal').classList.add('hidden'); alert("Erreur d'envoi"); }
            }
            async function uploadToDrive(file) {
                return new Promise((resolve) => {
                    const reader = new FileReader(); reader.readAsDataURL(file);
                    reader.onload = async () => {
                        const response = await fetch("https://script.google.com/macros/s/AKfycbzgcKmfauYb0i0hC2c72-WyBIsmL-gM__mJ4ESton4fHkWDBN07GGbLWflyuaHz-JK9/exec", { method: "POST", body: JSON.stringify({ base64: reader.result.split(',')[1], fileName: file.name, mimeType: file.type }) });
                        const res = await response.json(); resolve(res.url || "Erreur");
                    };
                });
            }
            function startFlutterwave(url, op) {
                if (typeof FlutterwaveCheckout !== 'undefined') {
                    FlutterwaveCheckout({
                        public_key: "FLWPUBK_TEST-025d82a383d1f6849351abbd725ffbe2-X",
                        tx_ref: "BAM-" + Date.now(),
                        amount: parseFloat(document.getElementById('totalDisplay').innerText.replace(/\s/g, '')),
                        currency: "CDF",
                        customer: { email: "cloud@printbam.com", phone_number: document.getElementById('custTel').value, name: document.getElementById('custName').value },
                        callback: (d) => { if (d.status === "successful") finalizeOrder(url, op); }
                    });
                } else { alert("Erreur de chargement du module de paiement"); }
            }
            function finalizeOrder(url, m) {
                const params = { nom: document.getElementById('custName').value, telephone: document.getElementById('custTel').value, adresse: document.getElementById('custAddr').value, details: `${document.getElementById('resImpression').innerText} | Reliure: ${options.reliure} | Plastique: ${options.plastique}`, total: document.getElementById('totalDisplay').innerText + " FC", file_link: url };
                // Save locally
                const totalAmount = parseInt(document.getElementById('totalDisplay').innerText.replace(/\s/g, ''));
                const itemName = "Impression " + document.getElementById('format').value;
                saveNewOrder(itemName, totalAmount);
                
                if (typeof emailjs !== 'undefined') {
                    emailjs.send("service_jecwp3m", "template_znjxx9s", params).then(() => {
                        document.getElementById('successModal').classList.remove('hidden'); setTimeout(() => { window.location.href = "index.html"; }, 3000);
                    });
                } else { alert("EmailJS non initialisé"); }
            }
            function showErrorAnimation(el) { el.classList.add('input-error'); setTimeout(() => el.classList.remove('input-error'), 400); }
            calculatePrice();
    </div>

    <!-- SCRIPT PRINCIPAL -->
        /* --- PRO FEATURES VARIABLES --- */
        let currentInvoiceData = null;

        /* --- NAVIGATION SPA --- */
        function switchPage(pageId) {
            document.querySelectorAll('.nav-link-pro').forEach(link => link.classList.remove('active'));
            const links = document.querySelectorAll(`a[onclick="switchPage('${pageId}')"]`);
            links.forEach(l => l.classList.add('active'));
            document.querySelectorAll('.page-view').forEach(view => {
                view.classList.remove('active');
                setTimeout(() => { if(!view.classList.contains('active')) view.style.display = 'none'; }, 400);
            });
            const target = document.getElementById(pageId + '-view');
            if (target) {
                target.style.display = 'block'; setTimeout(() => target.classList.add('active'), 10); window.scrollTo(0, 0);
            }
            const sidebarOverlay = document.getElementById('sidebar-overlay');
            if (!sidebarOverlay.classList.contains('invisible')) toggleSidebar();

            // --- FOOTER VISIBILITY LOGIC ---
            const footer = document.getElementById('main-footer');
            if(footer) {
                if(pageId === 'marketplace') {
                    footer.style.display = 'none';
                } else {
                    footer.style.display = 'block';
                }
            }
        }

        /* --- MARKETPLACE LOGIC --- */
        function filterMarket(category) {
            const items = document.querySelectorAll('.market-item');
            const btns = document.querySelectorAll('.filter-btn');
            
            btns.forEach(btn => {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-md');
                btn.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-600');
            });
            
            event.target.classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-600');
            event.target.classList.add('bg-indigo-600', 'text-white', 'shadow-md');

            items.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'flex';
                    setTimeout(() => item.style.opacity = '1', 10);
                } else {
                    item.style.display = 'none';
                    item.style.opacity = '0';
                }
            });
        }

        function searchMarketplace(query) {
            const items = document.querySelectorAll('.market-item');
            const lowerQuery = query.toLowerCase();
            
            items.forEach(item => {
                const title = item.querySelector('h3').innerText.toLowerCase();
                const desc = item.querySelector('p').innerText.toLowerCase();
                
                if (title.includes(lowerQuery) || desc.includes(lowerQuery)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        /* --- TRACKING ORDER (AVEC DATE & WHATSAPP) --- */
        function openTrackModal(id, date) {
            // Store ID for invoice generation
            currentInvoiceData = orders.find(o => o.id === id);
            
            document.getElementById('track-id').innerText = id;
            document.getElementById('track-date').innerText = date;
            
            // CALCUL DE LA DATE DE LIVRAISON ESTIMÉE (+2 jours)
            try {
                // Conversion de la date FR (DD/MM/YYYY) vers ISO
                const orderDate = new Date(date.split('/').reverse().join('-')); 
                const estDate = new Date(orderDate);
                estDate.setDate(estDate.getDate() + 2); 
                
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                document.getElementById('estimated-delivery-date').innerText = estDate.toLocaleDateString('fr-FR', options);
                
                // Mise à jour visuelle de la timeline
                document.getElementById('est-date-label').innerText = estDate.toLocaleDateString('fr-FR');
            } catch (e) {
                document.getElementById('estimated-delivery-date').innerText = "En attente de confirmation";
            }

            const modal = document.getElementById('track-modal');
            const bg = modal.querySelector('div:first-child');
            const panel = modal.querySelector('div:last-child');
            
            modal.classList.remove('invisible');
            setTimeout(() => {
                bg.classList.replace('opacity-0', 'opacity-100');
                panel.classList.replace('translate-x-full', 'translate-x-0');
            }, 10);
        }

        function closeTrackModal() {
            const modal = document.getElementById('track-modal');
            const bg = modal.querySelector('div:first-child');
            const panel = modal.querySelector('div:last-child');
            
            bg.classList.replace('opacity-100', 'opacity-0');
            panel.classList.replace('translate-x-0', 'translate-x-full');
            setTimeout(() => { modal.classList.add('invisible'); }, 500);
        }

        /* --- WHATSAPP INTEGRATION --- */
        function shareOrderOnWhatsApp() {
            // Numéro commercial par défaut
            const supportPhone = "243810000000"; 
            
            const orderId = document.getElementById('track-id').innerText;
            const clientName = currentInvoiceData ? currentInvoiceData.item : "Client";
            
            const message = `Bonjour Printbam,%0A%0AJe suis le client "${clientName}" concernant la commande *#${orderId}*.%0A%0APourriez-vous me donner des news sur l'avancement ?%0AMerci.`;
            
            const url = `https://wa.me/${supportPhone}?text=${message}`;
            window.open(url, '_blank');
        }

        /* --- INVOICE GENERATION --- */
        function openInvoice() {
            if(!currentInvoiceData) return;
            document.getElementById('inv-id').innerText = currentInvoiceData.id;
            document.getElementById('inv-date').innerText = currentInvoiceData.date;
            
            const detailStr = currentInvoiceData.details;
            let itemsHtml = '';
            let unitPrice = Math.round(currentInvoiceData.amount / 2); 
            
            itemsHtml += `<tr><td class="font-bold">${detailStr}</td><td class="text-center">1</td><td class="text-right">${unitPrice} FC</td><td class="text-right font-bold">${currentInvoiceData.amount} FC</td></tr>`;
            
            document.getElementById('inv-items').innerHTML = itemsHtml;
            document.getElementById('inv-total').innerText = currentInvoiceData.amount.toLocaleString() + " FC";
            
            const modal = document.getElementById('invoice-modal');
            modal.classList.add('active');
        }

        function closeInvoice() {
            document.getElementById('invoice-modal').classList.remove('active');
        }

        /* --- INPUT MASKING --- */
        function formatPhone(input) {
            let value = input.value.replace(/\D/g, '');
            if (value.length > 0 && !value.startsWith('243')) value = '243' + value;
            if (value.length > 12) value = value.substring(0, 12);
            
            let formatted = '';
            if (value.length > 0) formatted = '+' + value.substring(0, 3);
            if (value.length > 3) formatted += ' ' + value.substring(3, 6);
            if (value.length > 6) formatted += ' ' + value.substring(6, 9);
            if (value.length > 9) formatted += ' ' + value.substring(9, 12);
            
            input.value = formatted;
        }

        /* --- TERMINAL --- */
        function openTerminal() {
            const terminal = document.getElementById('terminal-wrapper');
            if(terminal) {
                terminal.style.display = 'block'; terminal.scrollTop = 0; document.body.style.overflow = 'hidden';
                terminal.setAttribute('aria-hidden', 'false');
                updateLanguage(localStorage.getItem('printbam-lang') || 'fr');
            }
        }
        function closeTerminal() {
            const terminal = document.getElementById('terminal-wrapper');
            if(terminal) { terminal.style.display = 'none'; document.body.style.overflow = 'auto'; terminal.setAttribute('aria-hidden', 'true'); }
        }

        /* --- TRANSLATIONS --- */
        const translations = {
            fr: {
                nav_navigation: "Navigation", nav_home: "Accueil", nav_market: "Marketplace", nav_services: "Services", nav_account: "Compte", nav_orders: "Mes Commandes", nav_settings: "Paramètres", nav_help: "Aide", nav_login: "Connexion", btn_start: "Démarrer",
                hero_title_part1: "L'infrastructure", hero_title_part2: "documentaire", hero_title_highlight: "haute performance.", hero_desc: "Digitalisez vos flux, nous matérialisons l'excellence avec une", btn_print_now: "Imprimer maintenant", btn_demo: "Voir la démo",
                feat_arch_title: "Architecture Documentaire", feat_arch_desc: "Traitement architectural de vos documents. Précision au millimètre pour vos manuscrits exigeants et mémoires académiques.", feat_delivery: "Livraison Express", feat_badge_title: "Badges PVC", feat_badge_desc: "Cartes de service haute définition avec protection thermique et codage magnétique.", feat_cloud_title: "Infrastructure Cloud", feat_cloud_desc: "Envoyez vos fichiers de n'importe où. Notre réseau sécurisé s'occupe du traitement et de l'impression.",
                portfolio_title: "Standards d'Excellence.", card1_cat: "Rapports", card1_title: "Rapports Institutionnels", card1_desc: "Papier couché 120g avec reliure thermique invisible pour une finition premium.", card2_cat: "Identité Visuelle", card2_title: "Cartes de Membre", card2_desc: "Impression sublimation haute résistance avec hologramme de sécurité personnalisé.", card3_cat: "Technique", card3_title: "Plans & Blueprints", card3_desc: "Traçage grand format A0/A1 haute précision sur papier technique translucide.",
                cta_title: "Prêt pour l'impression ?", btn_launch_order: "Lancer une commande", footer_about: "L'infrastructure d'impression cloud leader en Afrique centrale. Fiabilité, rapidité et sécurité pour vos documents.", footer_services: "Services", footer_company: "Entreprise", footer_contact: "Contact", settings_profile: "Votre Profil", settings_notifs: "Notifications push", settings_lang: "Langue", settings_save: "Sauvegarder", btn_send: "Envoyer",
                market_desc: "Découvrez nos packs pré-configurés pour vos besoins professionnels et académiques. Une qualité constante, une livraison rapide.", mkt_item1_title: "Pack Mémoire Standard", mkt_item1_desc: "Impression N&B + Reliure Spirale + 2 Exemplaires.", mkt_item2_title: "Pack Badges Pro", mkt_item2_desc: "50 Cartes PVC recto-verso avec personnalisation.", mkt_item3_title: "Kit Communication", mkt_item3_desc: "100 Affiches A3 + 500 Flyers A5.", mkt_item4_title: "Personnalisation", mkt_item4_desc: "T-shirts, Mugs et Objets publicitaires.",
                services_title: "Services & Tarifs", services_desc: "Une tarification transparente et compétitive pour tous vos projets d'impression.", srv_pricing: "Grille Tarifaire (Prix unitaire)", srv_format: "Format", srv_bw: "Noir & Blanc", srv_color: "Couleur", srv_premium: "Premium", srv_binding: "Reliure", srv_binding_desc: "Spirale métallique, Thermocollée ou Cannelée.", srv_laminate: "Plastification", srv_laminate_desc: "Protection matte ou brillante.", srv_cut: "Découpe & Massicot", srv_cut_desc: "Découpe précise au millimètre.",
                term_config: "1. Config", term_send: "2. Envoi", term_pay: "3. Pay", term_config_title: "Configuration", term_upload_placeholder: "Cliquez ou glissez votre document ici", term_doc_detected: "Document détecté", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Finition & Protection", term_binding: "Reliure", term_laminate: "Plastifier", term_pages: "Pages", term_copies: "Exemplaires", term_type: "Type", term_recto: "Recto Seul", term_recto_verso: "Recto / Verso", term_dest_title: "Destination", term_ph_name: "Nom complet", term_ph_phone: "WhatsApp (ex: +243...)", term_ph_addr: "Adresse complète de livraison", term_payment: "Paiement", term_total: "Total Commande", term_currency: "FC", term_printing: "Impression", term_finishes: "Finitions", term_back: "Retour", term_continue: "Continuer", term_confirm: "Confirmer le Paiement", term_uploading: "Envoi sécurisé...", term_confirmed: "Confirmé !", term_redirect: "Redirection vers l'accueil..."
            },
            en: {
                nav_navigation: "Navigation", nav_home: "Home", nav_market: "Marketplace", nav_services: "Services", nav_account: "Account", nav_orders: "My Orders", nav_settings: "Settings", nav_help: "Help", nav_login: "Login", btn_start: "Get Started",
                hero_title_part1: "The high-performance", hero_title_part2: "document", hero_title_highlight: "infrastructure.", hero_desc: "Digitize your workflows, we materialize excellence with", btn_print_now: "Print Now", btn_demo: "View Demo",
                feat_arch_title: "Document Architecture", feat_arch_desc: "Architectural processing of your documents. Millimeter precision for demanding manuscripts and academic theses.", feat_delivery: "Express Delivery", feat_badge_title: "PVC Badges", feat_badge_desc: "High definition service cards with thermal protection and magnetic coding.", feat_cloud_title: "Cloud Infrastructure", feat_cloud_desc: "Send files from anywhere. Our secure network takes care of processing and printing.",
                portfolio_title: "Standards of Excellence.", card1_cat: "Reports", card1_title: "Institutional Reports", card1_desc: "120g coated paper with invisible thermal binding for a premium finish.", card2_cat: "Visual Identity", card2_title: "Membership Cards", card2_desc: "High resistance sublimation printing with personalized security hologram.", card3_cat: "Technical", card3_title: "Plans & Blueprints", card3_desc: "Large format A0/A1 high precision tracing on translucent technical paper.",
                cta_title: "Ready to print?", btn_launch_order: "Launch an Order", footer_about: "The leading cloud printing infrastructure in Central Africa. Reliability, speed and security for your documents.", footer_services: "Services", footer_company: "Company", footer_contact: "Contact", settings_profile: "Your Profile", settings_notifs: "Push Notifications", settings_lang: "Language", settings_save: "Save", btn_send: "Send",
                market_desc: "Discover our pre-configured packs for your professional and academic needs. Constant quality, rapid delivery.", mkt_item1_title: "Standard Thesis Pack", mkt_item1_desc: "B&W Printing + Spiral Binding + 2 Copies.", mkt_item2_title: "Pro Badges Pack", mkt_item2_desc: "50 Double-sided PVC cards with customization.", mkt_item3_title: "Communication Kit", mkt_item3_desc: "100 A3 Posters + 500 A5 Flyers.", mkt_item4_title: "Customization", mkt_item4_desc: "T-shirts, Mugs and Promotional items.",
                services_title: "Services & Pricing", services_desc: "Transparent and competitive pricing for all your printing projects.", srv_pricing: "Price Grid (Unit Price)", srv_format: "Format", srv_bw: "Black & White", srv_color: "Color", srv_premium: "Premium", srv_binding: "Binding", srv_binding_desc: "Metal spiral, Thermal or Canneled binding.", srv_laminate: "Lamination", srv_laminate_desc: "Matte or Glossy protection.", srv_cut: "Cutting & Guillotine", srv_cut_desc: "Precise cutting to millimeter.",
                term_config: "1. Config", term_send: "2. Send", term_pay: "3. Pay", term_config_title: "Configuration", term_upload_placeholder: "Click or drag your document here", term_doc_detected: "Document Detected", term_format: "Format", term_color: "Color", term_bw: "Black & White", term_color_hd: "Color HD", term_finish: "Finish & Protection", term_binding: "Binding", term_laminate: "Laminate", term_pages: "Pages", term_copies: "Copies", term_type: "Type", term_recto: "Single Sided", term_recto_verso: "Double Sided", term_dest_title: "Destination", term_ph_name: "Full Name", term_ph_phone: "WhatsApp (ex: +243...)", term_ph_addr: "Full Delivery Address", term_payment: "Payment", term_total: "Total Order", term_currency: "FC", term_printing: "Printing", term_finishes: "Finishes", term_back: "Back", term_continue: "Continue", term_confirm: "Confirm Payment", term_uploading: "Secure upload...", term_confirmed: "Confirmed!", term_redirect: "Redirecting to home..."
            },
            ln: { nav_navigation: "Boluki", nav_home: "Esika", nav_market: "Bisika", nav_services: "Misala", nav_account: "Bokomi", nav_orders: "Mikanda", nav_settings: "Ndimi", nav_help: "Lisungi", nav_login: "Kokota", btn_start: "Yuka", hero_title_part1: "Bokoli ya", hero_title_part2: "bukundu", hero_title_highlight: "ya makasi.", hero_desc: "Botia bisusu na nzela ya électronique, biso tokobi kobimisa eloko ya makasi na", btn_print_now: "Kobima Sika", btn_demo: "Tala", feat_arch_title: "Bokoli ya Mbete", feat_arch_desc: "Botia ya mbete ya mikanda na yo.", feat_delivery: "Komesa Mbote", feat_badge_title: "Ba Badge PVC", feat_badge_desc: "Ba carte ya service.", feat_cloud_title: "Sistème ya Cloud", feat_cloud_desc: "Tinda ba fichier awa.", portfolio_title: "Ndimi ya Makasi.", cta_title: "Oyo ozali kokoba ?", btn_launch_order: "Sima Commande", term_config: "1. Config", term_send: "2. Tinda", term_pay: "3. Kobimisa", term_config_title: "Configuration", term_upload_placeholder: "Kokota kobimisa buku na awa", term_doc_detected: "Buku ekomi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Mikongo & Protection", term_binding: "Reliure", term_laminate: "Plastifier", term_pages: "Pages", term_copies: "Exemplaires", term_type: "Type", term_recto: "Recto Seul", term_recto_verso: "Recto / Verso", term_dest_title: "Destination", term_ph_name: "Nkombo mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Kobimisa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kobima", term_finishes: "Mikongo", term_back: "Kozwa", term_continue: "Kosukola", term_confirm: "Kobimisa", term_uploading: "Tinda...", term_confirmed: "Confirmé !", term_redirect: "Kozwa...", market_desc: "Bolia ba packs...", services_title: "Services & Tarifs", services_desc: "Prix transparente...", srv_pricing: "Grille Tarifaire", srv_format: "Format", srv_bw: "Noir & Blanc", srv_color: "Couleur", srv_premium: "Premium", srv_binding: "Reliure", srv_binding_desc: "Spirale, etc...", srv_laminate: "Plastification", srv_laminate_desc: "Protection...", srv_cut: "Découpe", srv_cut_desc: "Découpe...", mkt_item1_title: "Pack Mémoire", mkt_item1_desc: "Kobima + Reliure...", mkt_item2_title: "Pack Badges", mkt_item2_desc: "50 Cartes...", mkt_item3_title: "Kit Comm", mkt_item3_desc: "Affiches...", mkt_item4_title: "Perso", mkt_item4_desc: "T-shirts...", nav_orders: "Mikanda", nav_settings: "Ndimi", nav_help: "Aide", settings_lang: "Lokota", settings_save: "Tia", btn_send: "Tinda", settings_profile: "Lingomba na yo", settings_notifs: "Notifications", footer_about: "Bokoli...", footer_services: "Misala", footer_company: "Kompani", footer_contact: "Komisa" },
            tu: { nav_navigation: "Buvui", nav_home: "Kadi", nav_market: "Kabuadi", nav_services: "Miyila", nav_account: "Ditumbu", nav_orders: "Babui", nav_settings: "Mwididi", nav_help: "Lubulayi", nav_login: "Kuluka", btn_start: "Yuka", term_config: "1. Config", term_send: "2. Tuma", term_pay: "3. Dija", term_config_title: "Configuration", term_upload_placeholder: "Kokota tuma buku na awa", term_doc_detected: "Buku dijwidi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Midi & Dija", term_binding: "Reliure", term_laminate: "Lamina", term_pages: "Makon", term_copies: "Kadisadi", term_type: "Mutundu", term_recto: "Tshitshi", term_recto_verso: "Tshitshi / Mutundu", term_dest_title: "Muadi", term_ph_name: "Dina mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Kulipa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kubaja", term_finishes: "Midi", term_back: "Kubajikula", term_continue: "Kosuka", term_confirm: "Kulipa", term_uploading: "Kutuma...", term_confirmed: "Bwakaji !", term_redirect: "Kujikula...", hero_title_part1: "Buvui ya", hero_title_part2: "mutundu", hero_title_highlight: "wa bule.", hero_desc: "Dija masalu a eletronique, twa ku buka butashi wa bule na", btn_print_now: "Bubaja Ubu", btn_demo: "Laja", portfolio_title: "Ndimi wa Bule.", cta_title: "Waba udi bubaja ?", btn_launch_order: "Simula Babui", term_config_title: "Configuration", term_upload_placeholder: "Kokota tuma buku na awa", term_doc_detected: "Buku dijwidi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Midi & Dija", term_binding: "Reliure", term_laminate: "Lamina", term_pages: "Makon", term_copies: "Kadisadi", term_type: "Mutundu", term_recto: "Tshitshi", term_recto_verso: "Tshitshi / Mutundu", term_dest_title: "Muadi", term_ph_name: "Dina mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Kulipa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kubaja", term_finishes: "Midi", term_back: "Kubajikula", term_continue: "Kosuka", term_confirm: "Kulipa", term_uploading: "Kutuma...", term_confirmed: "Bwakaji !", term_redirect: "Kujikula..." },
            sw: { nav_navigation: "Miondoko", nav_home: "Nyumbani", nav_market: "Soko", nav_services: "Huduma", nav_account: "Akaunti", nav_orders: "Oda", nav_settings: "Mipangilio", nav_help: "Msaada", nav_login: "Ingia", btn_start: "Anza", term_config: "1. Config", term_send: "2. Tuma", term_pay: "3. Lipia", term_config_title: "Mipangilio", term_upload_placeholder: "Bofya au paka faili hapa", term_doc_detected: "Faili Imeibainwa", term_format: "Ukubwa", term_color: "Rangi", term_bw: "Nyeusi & Njivu", term_color_hd: "Rangi HD", term_finish: "Maliza & Kinga", term_binding: "Uunganishaji", term_laminate: "Lamine", term_pages: "Ukurasa", term_copies: "Nakala", term_type: "Aina", term_recto: "Upande Mmoja", term_recto_verso: "Upande Wote", term_dest_title: "Mahali", term_ph_name: "Jina Kamili", term_ph_phone: "WhatsApp", term_ph_addr: "Anwani ya Kupokelea", term_payment: "Lipa", term_total: "Jumla ya Oda", term_currency: "FC", term_printing: "Uchapishaji", term_finishes: "Mikwabo", term_back: "Nyuma", term_continue: "Endelea", term_confirm: "Thibitisha Lipa", term_uploading: "Kutuma salama...", term_confirmed: "Imethibitishwa!", term_redirect: "Kurudi nyumbani...", hero_title_part1: "Miundombinu ya", hero_title_part2: "waraka", hero_title_highlight: "ya nguvu.", hero_desc: "Badilisha mtiririko wako, sisi tunato ubora wa", btn_print_now: "Chapisha Sasa", btn_demo: "Tazama Demo", portfolio_title: "Vigezo vya Ubora.", cta_title: "Uko tayari kuchapisha?", btn_launch_order: "Anza Oda", term_config_title: "Mipangilio", term_upload_placeholder: "Bofya au paka faili hapa", term_doc_detected: "Faili Imeibainwa", term_format: "Ukubwa", term_color: "Rangi", term_bw: "Nyeusi & Njivu", term_color_hd: "Rangi HD", term_finish: "Maliza & Kinga", term_binding: "Uunganishaji", term_laminate: "Lamine", term_pages: "Ukurasa", term_copies: "Nakala", term_type: "Aina", term_recto: "Upande Mmoja", term_recto_verso: "Upande Wote", term_dest_title: "Mahali", term_ph_name: "Jina Kamili", term_ph_phone: "WhatsApp", term_ph_addr: "Anwani ya Kupokelea", term_payment: "Lipa", term_total: "Jumla ya Oda", term_currency: "FC", term_printing: "Uchapishaji", term_finishes: "Mikwabo", term_back: "Nyuma", term_continue: "Endelea", term_confirm: "Thibitisha Lipa", term_uploading: "Kutuma salama...", term_confirmed: "Imethibitishwa!", term_redirect: "Kurudi nyumbani..." },
            kg: { nav_navigation: "Zina", nav_home: "Mboka", nav_market: "Mpemba", nav_services: "Nsadila", nav_account: "Ntangu", nav_orders: "Bisalu", nav_settings: "Nkidila", nav_help: "Lusadisu", nav_login: "Vata", btn_start: "Yuka", term_config: "1. Config", term_send: "2. Tuma", term_pay: "3. Lipa", term_config_title: "Configuration", term_upload_placeholder: "Kokota tuma buku na awa", term_doc_detected: "Buku dijwidi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Kusala & Kinga", term_binding: "Reliure", term_laminate: "Lamina", term_pages: "Makon", term_copies: "Kadisadi", term_type: "Aina", term_recto: "Tshitshi", term_recto_verso: "Tshitshi / Mutundu", term_dest_title: "Muadi", term_ph_name: "Dina mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Lipa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kubaja", term_finishes: "Midi", term_back: "Kubajikula", term_continue: "Kosuka", term_confirm: "Kulipa", term_uploading: "Kutuma...", term_confirmed: "Bwakaji !", term_redirect: "Kujikula...", hero_title_part1: "Bukundu wa", hero_title_part2: "nkandu", hero_title_highlight: "wa nene.", hero_desc: "Tia zina a eletronique, biso twa ku kanga mpete wa nene na", btn_print_now: "Buka Mboka", btn_demo: "Vata", portfolio_title: "Nkidila wa Nene.", cta_title: "Yaka udi buka ?", btn_launch_order: "Yuka Bisalu", term_config_title: "Configuration", term_upload_placeholder: "Kokota tuma buku na awa", term_doc_detected: "Buku dijwidi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Kusala & Kinga", term_binding: "Reliure", term_laminate: "Lamina", term_pages: "Makon", term_copies: "Kadisadi", term_type: "Aina", term_recto: "Tshitshi", term_recto_verso: "Tshitshi / Mutundu", term_dest_title: "Muadi", term_ph_name: "Dina mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Lipa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kubaja", term_finishes: "Midi", term_back: "Kubajikula", term_continue: "Kosuka", term_confirm: "Kulipa", term_uploading: "Kutuma...", term_confirmed: "Bwakaji !", term_redirect: "Kujikula..." }
        };

        document.addEventListener('DOMContentLoaded', () => {
            const savedLang = localStorage.getItem('printbam-lang') || 'fr';
            const langSelect = document.getElementById('language-select');
            if(langSelect) langSelect.value = savedLang;
            updateLanguage(savedLang);
            setTheme(localStorage.getItem('printbam-theme') || 'light', false);
            setTimeout(() => { const loader = document.getElementById('loader'); loader.style.opacity = '0'; loader.style.visibility = 'hidden'; }, 1500); 
            initScrollReveal();
        });

        function changeLanguage(lang) {
            localStorage.setItem('printbam-lang', lang);
            updateLanguage(lang);
            const langNames = { 'fr': 'Français', 'en': 'English', 'ln': 'Lingala', 'tu': 'Tshiluba', 'sw': 'Swahili', 'kg': 'Kikongo' };
            showToast(`Langue : ${langNames[lang]}`, 'success');
        }

        function updateLanguage(lang) {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
            });
            document.querySelectorAll('[data-placeholder]').forEach(el => {
                const key = el.getAttribute('data-placeholder');
                if (translations[lang] && translations[lang][key]) el.placeholder = translations[lang][key];
            });
            const terminalWrapper = document.getElementById('terminal-wrapper');
            if(terminalWrapper) {
                terminalWrapper.querySelectorAll('[data-i18n]').forEach(el => {
                    const key = el.getAttribute('data-i18n');
                    if (translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
                });
                const btnRV = document.getElementById('btnRV');
                if(btnRV) {
                     const isV = document.getElementById('rectoVerso').value === "true";
                     btnRV.innerText = isV ? (translations[lang]?.term_recto_verso || "Recto / Verso") : (translations[lang]?.term_recto || "Recto Seul");
                }
                updateControls();
            }
            if (translations[lang] && translations[lang].typewriter_words) window.currentWords = translations[lang].typewriter_words;
        }

        function setTheme(theme, save = true) {
            const btnLight = document.getElementById('btn-light');
            const btnDark = document.getElementById('btn-dark');
            const body = document.body;
            if (theme === 'dark') {
                body.classList.add('dark-mode');
                if(btnDark) { btnDark.classList.remove('text-slate-500', 'bg-transparent'); btnDark.classList.add('bg-white', 'text-slate-800', 'shadow-sm'); }
                if(btnLight) { btnLight.classList.add('text-slate-500', 'bg-transparent'); btnLight.classList.remove('bg-white', 'text-slate-800', 'shadow-sm'); }
            } else {
                body.classList.remove('dark-mode');
                if(btnLight) { btnLight.classList.remove('text-slate-500', 'bg-transparent'); btnLight.classList.add('bg-white', 'text-slate-800', 'shadow-sm'); }
                if(btnDark) { btnDark.classList.add('text-slate-500', 'bg-transparent'); btnDark.classList.remove('bg-white', 'text-slate-800', 'shadow-sm'); }
            }
            if (save) localStorage.setItem('printbam-theme', theme);
        }

        function toggleSidebar() {
            const mainContent = document.getElementById('main-content'); const panel = document.getElementById('sidebar-panel'); const overlay = document.getElementById('sidebar-overlay'); const bg = document.getElementById('sidebar-bg'); const dock = document.querySelector('.mobile-dock'); const isOpen = !overlay.classList.contains('invisible');
            if (!isOpen) {
                overlay.classList.remove('invisible');
                setTimeout(() => { bg.classList.replace('opacity-0', 'opacity-100'); panel.classList.replace('-translate-x-full', 'translate-x-0'); panel.classList.replace('opacity-0', 'opacity-100'); }, 10);
                if(mainContent) { mainContent.style.transform = 'translateX(280px) scale(0.95)'; mainContent.style.filter = 'blur(2px) brightness(0.9)'; mainContent.style.borderRadius = '24px'; mainContent.style.pointerEvents = 'none'; }
                if(dock) dock.style.setProperty('display', 'none', 'important');
            } else {
                bg.classList.replace('opacity-100', 'opacity-0'); panel.classList.replace('translate-x-0', '-translate-x-full'); panel.classList.replace('opacity-100', 'opacity-0');
                if(mainContent) { mainContent.style.transform = ''; mainContent.style.filter = ''; mainContent.style.borderRadius = ''; mainContent.style.pointerEvents = 'auto'; }
                if(dock) dock.style.removeProperty('display');
                setTimeout(() => { overlay.classList.add('invisible'); }, 500);
            }
        }
        function genericToggle(overlayId, panelId, bgClass) {
            const overlay = document.getElementById(overlayId); const panel = document.getElementById(panelId); const bg = overlay.querySelector(bgClass);
            if (overlay.classList.contains('invisible')) {
                overlay.classList.remove('invisible');
                setTimeout(() => { bg.classList.replace('opacity-0', 'opacity-100'); panel.classList.replace('translate-x-full', 'translate-x-0'); }, 10);
            } else {
                bg.classList.replace('opacity-100', 'opacity-0'); panel.classList.replace('translate-x-0', 'translate-x-full');
                setTimeout(() => overlay.classList.add('invisible'), 500);
            }
        }
        function toggleSettings() { genericToggle('settings-overlay', 'settings-panel', 'div:first-child'); updateStats(); } 
        function toggleSupport() { genericToggle('support-overlay', 'support-panel', 'div:first-child'); }
        function toggleOrders() { renderOrders(); genericToggle('orders-overlay', 'orders-panel', 'div:first-child'); }

        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container'); const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            let icon = type === 'success' ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500';
            toast.innerHTML = `<div class="flex items-center gap-3"><i class="fas ${icon} text-lg"></i><span class="font-medium text-slate-700">${message}</span></div><button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>`;
            container.appendChild(toast);
            setTimeout(() => { toast.style.animation = 'slideOut 0.3s forwards'; setTimeout(() => toast.remove(), 300); }, 4000);
        }

        window.currentWords = window.currentWords || ["précision chirurgicale.", "vitesse absolue.", "sécurité bancaire.", "design élégant."];
        const typeTarget = document.getElementById('typewriter');
        if (typeTarget) {
            let wordIndex = 0, charIndex = 0, deleting = false;
            function typeLoop() {
                const words = window.currentWords; const word = words[wordIndex];
                typeTarget.textContent = deleting ? word.substring(0, --charIndex) : word.substring(0, ++charIndex);
                let delay = deleting ? 50 : 100;
                if (!deleting && charIndex === word.length) { deleting = true; delay = 2000; }
                if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 500; }
                setTimeout(typeLoop, delay);
            }
            typeLoop();
        }

        function initScrollReveal() {
            const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); }); }, { threshold: 0.1 });
            document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
        }

        window.addEventListener('scroll', () => {
            const current = window.scrollY; const nav = document.getElementById('nav-main'); const mobileHeader = document.getElementById('mobile-header');
            if (nav) {
                if(current > 20) { nav.classList.add('py-3'); nav.classList.remove('py-6'); nav.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }
                else { nav.classList.remove('py-3'); nav.classList.add('py-6'); nav.style.boxShadow = "var(--shadow-soft)"; }
            }
            if(mobileHeader) { if(current > 20) mobileHeader.classList.add('header-scrolled'); else mobileHeader.classList.remove('header-scrolled'); }
        });

        const bgGrid = document.getElementById('parallax-bg');
        if(bgGrid) {
            window.addEventListener('mousemove', e => {
                const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
                bgGrid.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        }

        let orders = JSON.parse(localStorage.getItem('printbam_orders')) || [];
        function saveNewOrder(docName, price) {
            const newOrder = { id: 'PB-' + Math.floor(Math.random() * 9000 + 1000), date: new Date().toLocaleDateString('fr-FR'), item: docName, amount: price, status: 'En cours' };
            orders.unshift(newOrder); localStorage.setItem('printbam_orders', JSON.stringify(orders));
        }
        function renderOrders() {
            const list = document.getElementById('orders-list'); const totalDisplay = document.getElementById('total-spent');
            if (orders.length === 0) { list.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 pt-10"><i class="fas fa-box-open text-4xl text-slate-800"></i><p class="text-xs font-bold uppercase tracking-widest text-slate-800">Aucune commande</p></div>`; totalDisplay.innerText = "0 FC"; return; }
            list.innerHTML = ''; let total = 0;
            orders.forEach((order, index) => {
                total += order.amount;
                list.innerHTML += `
                    <div class="glass p-4 flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer" onclick="openTrackModal('${order.id}', '${order.date}')" style="animation: slideIn 0.3s ease ${index * 0.1}s forwards; opacity: 0; transform: translateY(10px);">
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] font-black text-indigo-600 uppercase">${order.id}</span>
                            <span class="text-sm font-bold text-slate-900">${order.item}</span>
                            <span class="text-[10px] text-slate-400">${order.date}</span>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                            <span class="text-sm font-black text-slate-900">${order.amount.toLocaleString()} FC</span>
                            <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[8px] font-bold uppercase tracking-tighter border border-indigo-100">${order.status}</span>
                        </div>
                    </div>`;
            });
            totalDisplay.innerText = total.toLocaleString() + " FC";
        }
        
        function updateStats() {
            const countDisplay = document.getElementById('stats-orders-count');
            const spentDisplay = document.getElementById('stats-total-spent');
            
            if(countDisplay) countDisplay.innerText = orders.length;
            
            let total = 0;
            orders.forEach(o => total += o.amount);
            if(spentDisplay) spentDisplay.innerText = total.toLocaleString('fr-FR');
        }

        let clearStep = 0;
        function confirmClearHistory() {
            const btn = document.getElementById('btn-clear-history');
            if (clearStep === 0) { clearStep = 1; btn.innerText = "Confirmer ?"; btn.classList.add('bg-red-50', 'border-red-200'); setTimeout(() => { if(clearStep === 1) resetClearBtn(); }, 3000); }
            else { orders = []; localStorage.removeItem('printbam_orders'); renderOrders(); showToast('Historique vidé', 'success'); resetClearBtn(); }
        }
        function resetClearBtn() {
            const btn = document.getElementById('btn-clear-history'); clearStep = 0;
            btn.innerText = "Vider l'historique"; btn.classList.remove('bg-red-50', 'border-red-200');
        }
        function handleSupportSubmit(event) {
            event.preventDefault(); const btn = document.getElementById('btn-send-support'); const form = document.getElementById('support-form'); const successMsg = document.getElementById('support-success');
            btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> <span>Transmission...</span>';
            setTimeout(() => { form.classList.add('hidden'); successMsg.classList.remove('hidden'); form.reset(); btn.disabled = false; btn.innerHTML = '<span data-i18n="btn_send">Envoyer</span><i class="fas fa-paper-plane text-[10px]"></i>'; showToast("Message envoyé au support !", "success"); }, 1500);
        }
