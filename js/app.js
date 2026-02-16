// --- DÉBUT DU SCRIPT ---

// 1. Configuration Supabase (Déjà présente, gardez-la)
const SUPABASE_URL = 'https://lqqtvumwdixlhamwmqii.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcXR2dW13ZGl4bGhhbXdtcWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyOTQ1NjMsImV4cCI6MjA4NTg3MDU2M30.QKTBQbZ78iRVyM1o-hhtAPkWP23h_vXAMA3zrfuzipY'; // Votre clé
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

            // --- STORE GLOBAL (CENTRALISÉ) ---
const AppState = {
    user: null,
    profile: null,
    blockedUsers: new Set(),
    chats: [],
    reactions: new Map(), // postId -> reactionType
    
    // Méthode pour mettre à jour et notifier (basique)
    update(key, value) {
        this[key] = value;
        // Ici vous pourriez déclencher des événements personnalisés si nécessaire
        console.log(`[AppState] Mis à jour: ${key}`);
    }
};
            
// 2. Variables Globales de gestion (CRUCIAL : Doivent être définies ici)
const userReactions = new Map(); // Stocke les réactions de l'utilisateur (postId -> type)
let chatInterval = null;
let currentTargetUserId = null;
let searchDebounceTimer = null;
let globalMessageListener = null;
let globalNotifListener = null;
let myChatIdsCache = new Set(); // Cache des IDs de chat de l'utilisateur
let chatStatusInterval = null;
            
// 3. Configuration des Réactions (Doit être accessible pour le Feed)
const REACTIONS = [
    { type: 'like', icon: 'fa-heart', color: 'text-red-500' },
    { type: 'support', icon: 'fa-hand-holding-heart', color: 'text-pink-500' },
    { type: 'curious', icon: 'fa-eye', color: 'text-blue-500' },
    { type: 'bravo', icon: 'fa-trophy', color: 'text-yellow-500' }
];

const REACTION_STYLES = {
    like: { icon: 'fa-heart', color: 'text-red-500' },
    support: { icon: 'fa-hand-holding-heart', color: 'text-pink-500' },
    curious: { icon: 'fa-eye', color: 'text-blue-500' },
    bravo: { icon: 'fa-trophy', color: 'text-yellow-500' }
};

// --- Suite du code (Variables Feed, etc.) ---
let feedOffset = 0;
const FEED_BATCH_SIZE = 10;
let isLoadingFeed = false;
let hasMorePosts = true;
let feedObserver = null;
// ... Le reste de votre code existant suit ici ...

// --- VARIABLES DU TERMINAL (Si elles n'existent pas déjà) ---
let currentStep = 1;
let options = { reliure: false, plastique: false };

// --- FONCTION MANQUANTE À AJOUTER ---
function updateControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    // On récupère la langue actuelle pour les textes
    const lang = localStorage.getItem('printbam-lang') || 'fr';

    // Gestion du bouton RETOUR
    if (prevBtn) {
        prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    // Gestion du bouton SUIVANT / CONFIRMER
    if (nextBtn) {
        if (currentStep === 3) {
            nextBtn.innerText = translations[lang]?.term_confirm || "Confirmer le Paiement";
        } else {
            nextBtn.innerText = translations[lang]?.term_continue || "Continuer";
        }
    }
}
            function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
    
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

            // --- AJOUTEZ CECI : GESTION DU DOCK (BARRE DU BAS) ---
    const dock = document.querySelector('.mobile-dock');

    if (pageId === 'messages' || pageId === 'chat') {
        // Si on est sur Messages ou Chat, on cache le dock
        dock.classList.add('dock-hidden');
    } else {
        // Sinon (Accueil, Profil, etc.), on l'affiche
        dock.classList.remove('dock-hidden');
    }
            
            if (pageId === 'admin') {
            loadAdminArticles(); // Charge les articles
            loadAdminUsers();   // <--- AJOUTEZ CETTE LIGNE C'EST CRUCIAL
        }
            if (pageId === 'profile-social') {
            loadSocialProfile();
        }
            // Chargement Notifications
    if (pageId === 'notifications') {
        loadNotifications();
    }
             // Charger le Feed si on va sur l'accueil
    if (pageId === 'home') {
        loadGlobalFeed();
    }

    // Charger le Profil Social si on va sur le profil
    if (pageId === 'profile-social') {
        loadSocialProfile();
    }

            // --- AJOUTEZ CECI POUR LES MESSAGES ---
    if (pageId === 'messages') {
        loadChatList(); // Charge la liste des discussions (Style Photo 1)
    }
        }

        /* --- MARKETPLACE LOGIC --- */
        function filterMarket(category) {
            const items = document.querySelectorAll('.market-item');
            const btns = document.querySelectorAll('.filter-btn');
            
            btns.forEach(btn => {
                btn.classList.remove('btn-sky-yellow', 'text-white', 'shadow-md');
                btn.classList.add('bg-white', 'border', 'border-slate-200', 'text-slate-600');
            });
            
            event.target.classList.remove('bg-white', 'border', 'border-slate-200', 'text-slate-600');
            event.target.classList.add('btn-sky-yellow', 'text-white', 'shadow-md');

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
            const term = document.getElementById('terminal-wrapper');
            if (!term) return;
        
            // 1. On affiche et on débloque les interactions
            term.style.display = 'block';
            term.removeAttribute('inert'); 
            term.setAttribute('aria-hidden', 'false');
        
            // 2. On bloque le scroll du site derrière
            document.body.style.overflow = 'hidden';
        
            // 3. Sécurité : on force le focus sur le bouton de fermeture
            setTimeout(() => {
                const closeBtn = document.getElementById('close-terminal-btn');
                if (closeBtn) closeBtn.focus();
            }, 100);
        }
        
        function closeTerminal() {
            const term = document.getElementById('terminal-wrapper');
            if (!term) return;
        
            // 1. On cache et on verrouille
            term.style.display = 'none';
            term.setAttribute('inert', '');
            term.setAttribute('aria-hidden', 'true');
        
            // 2. On rend le scroll au site
            document.body.style.overflow = 'auto';
        
            // 3. On nettoie le focus pour éviter l'erreur console
            if (document.activeElement) document.activeElement.blur();
        }
        /* --- TRANSLATIONS --- */
        const translations = {
            fr: {
                nav_navigation: "Navigation", nav_home: "Accueil", nav_market: "Marketplace", nav_services: "Services", nav_account: "Compte", nav_orders: "Mes Commandes", nav_settings: "Paramètres", nav_help: "Aide", nav_login: "Connexion", btn_start: "Démarrer",
                hero_title_part1: "L'infrastructure", hero_title_part2: "documentaire", hero_title_highlight: "haute performance.", hero_desc: "Digitalisez vos flux, nous matérialisons l'excellence avec une", btn_print_now: "Imprimer maintenant", btn_demo: "Voir la démo", nav_about: "À propos",
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
                cta_title: "Ready to print?", btn_launch_order: "Launch an Order", footer_about: "The leading cloud printing infrastructure in Central Africa. Reliability, speed and security for your documents.", footer_services: "Services", footer_company: "Company", footer_contact: "Contact", settings_profile: "Your Profile", settings_notifs: "Push Notifications", settings_lang: "Language", settings_save: "Save", btn_send: "Send", nav_about: "About", 
                market_desc: "Discover our pre-configured packs for your professional and academic needs. Constant quality, rapid delivery.", mkt_item1_title: "Standard Thesis Pack", mkt_item1_desc: "B&W Printing + Spiral Binding + 2 Copies.", mkt_item2_title: "Pro Badges Pack", mkt_item2_desc: "50 Double-sided PVC cards with customization.", mkt_item3_title: "Communication Kit", mkt_item3_desc: "100 A3 Posters + 500 A5 Flyers.", mkt_item4_title: "Customization", mkt_item4_desc: "T-shirts, Mugs and Promotional items.",
                services_title: "Services & Pricing", services_desc: "Transparent and competitive pricing for all your printing projects.", srv_pricing: "Price Grid (Unit Price)", srv_format: "Format", srv_bw: "Black & White", srv_color: "Color", srv_premium: "Premium", srv_binding: "Binding", srv_binding_desc: "Metal spiral, Thermal or Canneled binding.", srv_laminate: "Lamination", srv_laminate_desc: "Matte or Glossy protection.", srv_cut: "Cutting & Guillotine", srv_cut_desc: "Precise cutting to millimeter.",
                term_config: "1. Config", term_send: "2. Send", term_pay: "3. Pay", term_config_title: "Configuration", term_upload_placeholder: "Click or drag your document here", term_doc_detected: "Document Detected", term_format: "Format", term_color: "Color", term_bw: "Black & White", term_color_hd: "Color HD", term_finish: "Finish & Protection", term_binding: "Binding", term_laminate: "Laminate", term_pages: "Pages", term_copies: "Copies", term_type: "Type", term_recto: "Single Sided", term_recto_verso: "Double Sided", term_dest_title: "Destination", term_ph_name: "Full Name", term_ph_phone: "WhatsApp (ex: +243...)", term_ph_addr: "Full Delivery Address", term_payment: "Payment", term_total: "Total Order", term_currency: "FC", term_printing: "Printing", term_finishes: "Finishes", term_back: "Back", term_continue: "Continue", term_confirm: "Confirm Payment", term_uploading: "Secure upload...", term_confirmed: "Confirmed!", term_redirect: "Redirecting to home..."
            },
            ln: { nav_navigation: "Boluki", nav_home: "Esika", nav_market: "Bisika", nav_services: "Misala", nav_account: "Bokomi", nav_orders: "Mikanda", nav_about: "Na ntina na biso", nav_settings: "Ndimi", nav_help: "Lisungi", nav_login: "Kokota", btn_start: "Yuka", hero_title_part1: "Bokoli ya", hero_title_part2: "bukundu", hero_title_highlight: "ya makasi.", hero_desc: "Botia bisusu na nzela ya électronique, biso tokobi kobimisa eloko ya makasi na", btn_print_now: "Kobima Sika", btn_demo: "Tala", feat_arch_title: "Bokoli ya Mbete", feat_arch_desc: "Botia ya mbete ya mikanda na yo.", feat_delivery: "Komesa Mbote", feat_badge_title: "Ba Badge PVC", feat_badge_desc: "Ba carte ya service.", feat_cloud_title: "Sistème ya Cloud", feat_cloud_desc: "Tinda ba fichier awa.", portfolio_title: "Ndimi ya Makasi.", cta_title: "Oyo ozali kokoba ?", btn_launch_order: "Sima Commande", term_config: "1. Config", term_send: "2. Tinda", term_pay: "3. Kobimisa", term_config_title: "Configuration", term_upload_placeholder: "Kokota kobimisa buku na awa", term_doc_detected: "Buku ekomi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Mikongo & Protection", term_binding: "Reliure", term_laminate: "Plastifier", term_pages: "Pages", term_copies: "Exemplaires", term_type: "Type", term_recto: "Recto Seul", term_recto_verso: "Recto / Verso", term_dest_title: "Destination", term_ph_name: "Nkombo mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Kobimisa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kobima", term_finishes: "Mikongo", term_back: "Kozwa", term_continue: "Kosukola", term_confirm: "Kobimisa", term_uploading: "Tinda...", term_confirmed: "Confirmé !", term_redirect: "Kozwa...", market_desc: "Bolia ba packs...", services_title: "Services & Tarifs", services_desc: "Prix transparente...", srv_pricing: "Grille Tarifaire", srv_format: "Format", srv_bw: "Noir & Blanc", srv_color: "Couleur", srv_premium: "Premium", srv_binding: "Reliure", srv_binding_desc: "Spirale, etc...", srv_laminate: "Plastification", srv_laminate_desc: "Protection...", srv_cut: "Découpe", srv_cut_desc: "Découpe...", mkt_item1_title: "Pack Mémoire", mkt_item1_desc: "Kobima + Reliure...", mkt_item2_title: "Pack Badges", mkt_item2_desc: "50 Cartes...", mkt_item3_title: "Kit Comm", mkt_item3_desc: "Affiches...", mkt_item4_title: "Perso", mkt_item4_desc: "T-shirts...", nav_orders: "Mikanda", nav_settings: "Ndimi", nav_help: "Aide", settings_lang: "Lokota", settings_save: "Tia", btn_send: "Tinda", settings_profile: "Lingomba na yo", settings_notifs: "Notifications", footer_about: "Bokoli...", footer_services: "Misala", footer_company: "Kompani", footer_contact: "Komisa" },
            tu: { nav_navigation: "Buvui", nav_about: "Bidi bitangila benu", nav_home: "Kadi", nav_market: "Kabuadi", nav_services: "Miyila", nav_account: "Ditumbu", nav_orders: "Babui", nav_settings: "Mwididi", nav_help: "Lubulayi", nav_login: "Kuluka", btn_start: "Yuka", term_config: "1. Config", term_send: "2. Tuma", term_pay: "3. Dija", term_config_title: "Configuration", term_upload_placeholder: "Kokota tuma buku na awa", term_doc_detected: "Buku dijwidi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Midi & Dija", term_binding: "Reliure", term_laminate: "Lamina", term_pages: "Makon", term_copies: "Kadisadi", term_type: "Mutundu", term_recto: "Tshitshi", term_recto_verso: "Tshitshi / Mutundu", term_dest_title: "Muadi", term_ph_name: "Dina mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Kulipa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kubaja", term_finishes: "Midi", term_back: "Kubajikula", term_continue: "Kosuka", term_confirm: "Kulipa", term_uploading: "Kutuma...", term_confirmed: "Bwakaji !", term_redirect: "Kujikula...", hero_title_part1: "Buvui ya", hero_title_part2: "mutundu", hero_title_highlight: "wa bule.", hero_desc: "Dija masalu a eletronique, twa ku buka butashi wa bule na", btn_print_now: "Bubaja Ubu", btn_demo: "Laja", portfolio_title: "Ndimi wa Bule.", cta_title: "Waba udi bubaja ?", btn_launch_order: "Simula Babui", term_config_title: "Configuration", term_upload_placeholder: "Kokota tuma buku na awa", term_doc_detected: "Buku dijwidi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Midi & Dija", term_binding: "Reliure", term_laminate: "Lamina", term_pages: "Makon", term_copies: "Kadisadi", term_type: "Mutundu", term_recto: "Tshitshi", term_recto_verso: "Tshitshi / Mutundu", term_dest_title: "Muadi", term_ph_name: "Dina mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Kulipa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kubaja", term_finishes: "Midi", term_back: "Kubajikula", term_continue: "Kosuka", term_confirm: "Kulipa", term_uploading: "Kutuma...", term_confirmed: "Bwakaji !", term_redirect: "Kujikula..." },
            sw: { nav_navigation: "Miondoko", nav_home: "Nyumbani", nav_about: "Kuhusu sisi", nav_market: "Soko", nav_services: "Huduma", nav_account: "Akaunti", nav_orders: "Oda", nav_settings: "Mipangilio", nav_help: "Msaada", nav_login: "Ingia", btn_start: "Anza", term_config: "1. Config", term_send: "2. Tuma", term_pay: "3. Lipia", term_config_title: "Mipangilio", term_upload_placeholder: "Bofya au paka faili hapa", term_doc_detected: "Faili Imeibainwa", term_format: "Ukubwa", term_color: "Rangi", term_bw: "Nyeusi & Njivu", term_color_hd: "Rangi HD", term_finish: "Maliza & Kinga", term_binding: "Uunganishaji", term_laminate: "Lamine", term_pages: "Ukurasa", term_copies: "Nakala", term_type: "Aina", term_recto: "Upande Mmoja", term_recto_verso: "Upande Wote", term_dest_title: "Mahali", term_ph_name: "Jina Kamili", term_ph_phone: "WhatsApp", term_ph_addr: "Anwani ya Kupokelea", term_payment: "Lipa", term_total: "Jumla ya Oda", term_currency: "FC", term_printing: "Uchapishaji", term_finishes: "Mikwabo", term_back: "Nyuma", term_continue: "Endelea", term_confirm: "Thibitisha Lipa", term_uploading: "Kutuma salama...", term_confirmed: "Imethibitishwa!", term_redirect: "Kurudi nyumbani...", hero_title_part1: "Miundombinu ya", hero_title_part2: "waraka", hero_title_highlight: "ya nguvu.", hero_desc: "Badilisha mtiririko wako, sisi tunato ubora wa", btn_print_now: "Chapisha Sasa", btn_demo: "Tazama Demo", portfolio_title: "Vigezo vya Ubora.", cta_title: "Uko tayari kuchapisha?", btn_launch_order: "Anza Oda", term_config_title: "Mipangilio", term_upload_placeholder: "Bofya au paka faili hapa", term_doc_detected: "Faili Imeibainwa", term_format: "Ukubwa", term_color: "Rangi", term_bw: "Nyeusi & Njivu", term_color_hd: "Rangi HD", term_finish: "Maliza & Kinga", term_binding: "Uunganishaji", term_laminate: "Lamine", term_pages: "Ukurasa", term_copies: "Nakala", term_type: "Aina", term_recto: "Upande Mmoja", term_recto_verso: "Upande Wote", term_dest_title: "Mahali", term_ph_name: "Jina Kamili", term_ph_phone: "WhatsApp", term_ph_addr: "Anwani ya Kupokelea", term_payment: "Lipa", term_total: "Jumla ya Oda", term_currency: "FC", term_printing: "Uchapishaji", term_finishes: "Mikwabo", term_back: "Nyuma", term_continue: "Endelea", term_confirm: "Thibitisha Lipa", term_uploading: "Kutuma salama...", term_confirmed: "Imethibitishwa!", term_redirect: "Kurudi nyumbani..." },
            kg: { nav_navigation: "Zina", nav_home: "Mboka", nav_market: "Mpemba", nav_services: "Nsadila", nav_account: "Ntangu", nav_orders: "Bisalu", nav_settings: "Nkidila", nav_help: "Lusadisu", nav_login: "Vata", btn_start: "Yuka", term_config: "1. Config", term_send: "2. Tuma", term_pay: "3. Lipa", term_config_title: "Configuration", term_upload_placeholder: "Kokota tuma buku na awa", term_doc_detected: "Buku dijwidi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Kusala & Kinga", term_binding: "Reliure", term_laminate: "Lamina", term_pages: "Makon", term_copies: "Kadisadi", term_type: "Aina", term_recto: "Tshitshi", term_recto_verso: "Tshitshi / Mutundu", term_dest_title: "Muadi", term_ph_name: "Dina mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Lipa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kubaja", term_finishes: "Midi", term_back: "Kubajikula", term_continue: "Kosuka", term_confirm: "Kulipa", term_uploading: "Kutuma...", term_confirmed: "Bwakaji !", term_redirect: "Kujikula...", hero_title_part1: "Bukundu wa", hero_title_part2: "nkandu", hero_title_highlight: "wa nene.", hero_desc: "Tia zina a eletronique, biso twa ku kanga mpete wa nene na", btn_print_now: "Buka Mboka", btn_demo: "Vata", portfolio_title: "Nkidila wa Nene.", cta_title: "Yaka udi buka ?", btn_launch_order: "Yuka Bisalu", term_config_title: "Configuration", term_upload_placeholder: "Kokota tuma buku na awa", term_doc_detected: "Buku dijwidi", term_format: "Format", term_color: "Couleur", term_bw: "Noir & Blanc", term_color_hd: "Couleur HD", term_finish: "Kusala & Kinga", term_binding: "Reliure", term_laminate: "Lamina", term_pages: "Makon", term_copies: "Kadisadi", term_type: "Aina", term_recto: "Tshitshi", term_recto_verso: "Tshitshi / Mutundu", term_dest_title: "Muadi", term_ph_name: "Dina mobimba", term_ph_phone: "WhatsApp", term_ph_addr: "Adrese", term_payment: "Lipa", term_total: "Total Commande", term_currency: "FC", term_printing: "Kubaja", term_finishes: "Midi", term_back: "Kubajikula", term_continue: "Kosuka", term_confirm: "Kulipa", term_uploading: "Kutuma...", term_confirmed: "Bwakaji !", term_redirect: "Kujikula..." }
        };

        // Initialisation de l'observateur au chargement de la page
function setupInfiniteScroll() {
    const loader = document.getElementById('feed-loader');
    
    // Si un observateur existe déjà, on le déconnecte
    if (feedObserver) {
        feedObserver.disconnect();
    }

    if (loader) {
        // Création de l'observateur
        feedObserver = new IntersectionObserver((entries) => {
            // Si le loader est visible dans l'écran
            if (entries[0].isIntersecting) {
                loadMoreFeed();
            }
        }, {
            rootMargin: '300px' // Déclenche 200px avant le vrai bas de page
        });

        feedObserver.observe(loader);
    }
}
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
                // --- NOUVEAU CODE ---
if(mainContent) { 
    // On retire 'transform' pour que 'position: sticky' fonctionne !
    // mainContent.style.transform = 'translateX(280px) scale(0.95)'; // <-- Supprimez ou commentezz ceci
    
    mainContent.style.filter = 'blur(2px) brightness(0.9)'; 
    mainContent.style.pointerEvents = 'none'; // Important : empêche de cliquer sur le contenu flouté
}
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
        function toggleAbout() {
            genericToggle('about-overlay', 'about-panel', 'div:first-child');
        }
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

       /* --- GESTION DU PROFIL UTILISATEUR (AVEC SUPABASE) --- */

// Fonction pour ouvrir/fermer le panneau
async function toggleProfile() {
    // Vérification de sécurité via Supabase Auth
    const isConnected = await checkAuth();
    if (!isConnected) return;
    
    genericToggle('profile-overlay', 'profile-panel', 'div:first-child');
    
    // Charger les données si on ouvre le panneau
    const overlay = document.getElementById('profile-overlay');
    if (!overlay.classList.contains('invisible')) {
        await loadUserProfile();
    }
}

// Vérifie si l'utilisateur est connecté via Supabase
async function checkAuth() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
        showToast("Veuillez vous connecter pour accéder à cette page.", "error");
        setTimeout(() => { window.location.href = "login.html"; }, 1000);
        return false;
    }
    return true;
}

// Charger les infos du profil depuis Supabase
async function loadUserProfile() {
    try {
        // 1. Récupérer l'utilisateur connecté depuis la session
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        
        if (authError || !user) {
            console.log("Utilisateur non connecté");
            return;
        }
        checkAdminStatus();

        // 2. Récupérer les données de la table 'profiles'
        // On utilise 'profile' comme nom de variable pour correspondre à votre suite de code
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id) // CORRECTION : On utilise user.id ici
            .maybeSingle(); 

        if (error) {
            console.error("Erreur lors de la récupération :", error.message);
            return;
        }

        // 3. Mise à jour de l'interface (DOM)
        if (profile) {
            console.log("Profil trouvé :", profile);
            
            // Remplissage des champs (avec repli sur les métadonnées si profil incomplet)
            if (document.getElementById('p-name'))
                document.getElementById('p-name').value = profile.full_name || user.user_metadata.full_name || '';
            
            if (document.getElementById('p-email'))
                document.getElementById('p-email').value = user.email || '';
            
            if (document.getElementById('p-phone')) // Remplacez 'else if' par 'if'
                document.getElementById('p-phone').value = profile.phone || '';
                        
            if (document.getElementById('p-bio'))
                document.getElementById('p-bio').value = profile.bio || '';

            // Gestion de l'avatar (Image vs Icon)
            const imgDisplay = document.getElementById('profile-avatar-img');
            const iconDisplay = document.getElementById('profile-avatar-icon');

            if (profile.is_certified) {
                // Afficher l'icône bleue
                if(imgDisplay) imgDisplay.classList.remove('hidden');
                iconDisplay.classList.add('hidden');
            } else {
                imgDisplay.classList.add('hidden');
                iconDisplay.classList.remove('hidden');
            }
        } else {
            console.log("Aucun profil trouvé dans la table 'profiles' pour cet ID.");
        }
    } catch (err) {
        console.error("Erreur inattendue :", err);
    }
}

// Gestion de l'image de profil (Upload Supabase Storage)
let avatarFile = null; // Variable temporaire pour stocker le fichier choisi

function handleProfileImage(input) {
    if (input.files && input.files[0]) {
        avatarFile = input.files[0]; // On stocke le fichier pour l'upload plus tard
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgDisplay = document.getElementById('profile-avatar-img');
            const iconDisplay = document.getElementById('profile-avatar-icon');
            
            imgDisplay.src = e.target.result;
            imgDisplay.classList.remove('hidden');
            iconDisplay.classList.add('hidden');
        }
        reader.readAsDataURL(input.files[0]);
    }
}
        
// Sauvegarder le profil (Upload image + Update BDD)
async function saveProfile(e) {
    e.preventDefault();
    
    // 1. Gestion de l'état du bouton
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML; // Utiliser innerHTML au cas où il y aurait des icônes
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

    try {
        // 2. Vérification de l'utilisateur
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) throw new Error("Session expirée. Veuillez vous reconnecter.");

        let avatarUrl = null;

        // 3. Gestion de l'Upload (si avatarFile existe dans votre scope global)
        // Note : assurez-vous que 'avatarFile' est bien défini quand l'utilisateur choisit un fichier
        if (typeof avatarFile !== 'undefined' && avatarFile) {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabaseClient.storage
                .from('avatars')
                .upload(fileName, avatarFile, {
                    upsert: true
                });

            if (uploadError) throw new Error("Erreur d'upload : " + uploadError.message);

            // Récupérer l'URL publique
            const { data: publicUrlData } = supabaseClient.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            avatarUrl = publicUrlData.publicUrl;
        }

        // 4. Préparation des données pour la table 'profiles'
        const updates = {
            id: user.id,
            // Ne pas mettre à jour l'email si votre table 'profiles' ne le gère pas (l'email est déjà dans auth.users)
            full_name: document.getElementById('p-name').value.trim(),
            phone: document.getElementById('p-phone').value.trim(),
            bio: document.getElementById('p-bio').value.trim(),
            updated_at: new Date().toISOString()
        };

        if (avatarUrl) {
            updates.avatar_url = avatarUrl;
        }

        // 5. Mise à jour dans la base de données
        const { error: updateError } = await supabaseClient
            .from('profiles')
            .upsert(updates, { onConflict: 'id' }); 

        if (updateError) throw updateError;

        // 6. Succès
        showToast("Profil mis à jour avec succès ! ✅", "success");
        
        // Rafraîchir l'interface si la fonction existe
        if (typeof loadUserProfile === 'function') await loadUserProfile();
        if (typeof toggleProfile === 'function') toggleProfile();

    } catch (error) {
        console.error("Erreur saveProfile:", error);
        showToast(error.message, "error");
    } finally {
        // 7. Reset de l'état
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (typeof avatarFile !== 'undefined') avatarFile = null; 
    }
}
        
        // Déconnexion
        async function logout() {
            if(confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
                await supabaseClient.auth.signOut();
                showToast("Déconnexion...", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            }
        }
    
        /* --- MISE À JOUR DES BLOCAGES D'ACCÈS --- */
        
        // Surcharge de la fonction openTerminal
        const originalOpenTerminal = openTerminal;
        openTerminal = async function() {
            const isConnected = await checkAuth();
            if (!isConnected) return;
            originalOpenTerminal();
        }
        
        // Surcharge de toggleOrders
        const originalToggleOrders = toggleOrders;
        toggleOrders = async function() {
            const isConnected = await checkAuth();
            if (!isConnected) return;
            originalToggleOrders();
        }

               /* --- GESTION DE L'ESPACE ADMIN --- */

async function checkAdminStatus() {
    try {
        // Correction de la parenthèse et de l'accolade ici :
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        
        if (authError || !user) return;

        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle(); 

        if (profile && profile.is_admin) {
            isCurrentUserAdmin = true;
            const adminLink = document.getElementById('nav-admin-link');
            if (adminLink) adminLink.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Erreur vérification admin :", error);
    }
}

// 2. Charger les articles dans la vue Admin
async function loadAdminArticles() {
    const list = document.getElementById('admin-articles-list');
    if (!list) return;

    // Loader initial
    list.innerHTML = '<div class="col-span-full text-center py-10"><i class="fas fa-circle-notch fa-spin text-2xl text-indigo-600"></i></div>';

    const { data: articles, error } = await supabaseClient
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        list.innerHTML = `<p class="col-span-full text-red-500 text-center py-10">Erreur de chargement: ${error.message}</p>`;
        return;
    }

    if (!articles || articles.length === 0) {
        list.innerHTML = '<div class="col-span-full text-center py-10 text-slate-400">Aucun article pour le moment.</div>';
        return;
    }

    list.innerHTML = articles.map(art => {
        // Préparation de l'image pour éviter les erreurs de backticks imbriqués
        const imageContent = art.image_url 
            ? `<img src="${art.image_url}" class="w-20 h-20 object-cover rounded-lg bg-slate-100 shadow-sm">` 
            : `<div class="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 border border-slate-200"><i class="fas fa-image text-xl"></i></div>`;

        // Nettoyage du contenu (enlève les balises HTML si présentes)
        const plainText = art.content.replace(/<[^>]*>/g, '');
        const excerpt = plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;

        return `
        <div class="glass p-6 flex flex-col sm:flex-row gap-4 items-start group hover:shadow-lg transition-all border border-white/20">
            <div class="flex-shrink-0">
                ${imageContent}
            </div>
            
            <div class="flex-1 flex flex-col h-full">
                <div class="mb-2">
                    <span class="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100 italic">
                        ${art.category || 'Général'}
                    </span>
                    <h3 class="text-lg font-extrabold text-slate-900 mt-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        ${art.title}
                    </h3>
                </div>
                
                <p class="text-xs text-slate-500 mb-4 line-clamp-2">
                    ${excerpt}
                </p>
                
                <div class="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/50">
                    <span class="text-xs font-medium text-slate-400">
                        <i class="far fa-calendar-alt mr-1"></i> 
                        ${new Date(art.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    <a href="javascript:void(0)" 
                       onclick="editArticle('${art.id}')"
                       class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:btn-sky-yellow hover:scale-110 transition-all">
                        <i class="fas fa-pencil-alt text-[10px]"></i>
                    </a>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// 3. Ouvrir/Fermermer la modale
function openArticleModal() {
    document.getElementById('article-modal').classList.remove('hidden');
    document.getElementById('article-form').reset();
}
function closeArticleModal() {
    document.getElementById('article-modal').classList.add('hidden');
}

// 4. Sauvegarder un nouvel article
async function saveArticle(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    
    // État de chargement "Ultra Pro"
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Publication...';

    try {
        const title = document.getElementById('art-title').value;
        const content = document.getElementById('art-content').value;
        const category = document.getElementById('art-category').value;
        const image_url = document.getElementById('art-image').value;

        // CORRECTION : Ajout de la fermeture de l'objet et de la parenthèse
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            throw new Error("Session expirée ou utilisateur non trouvé.");
        }

        // Insertion dans Supabase
        const { error } = await supabaseClient.from('articles').insert([{
            title,
            content,
            category,
            image_url,
            author_id: user.id,
            created_at: new Date().toISOString() // Bonne pratique pour le tri
        }]);

        if (error) throw error;

        // Succès
        showToast("Article publié avec succès !", "success");
        
        // Nettoyage et rafraîchissement
        if (typeof closeArticleModal === 'function') closeArticleModal();
        if (typeof loadAdminArticles === 'function') loadAdminArticles();
        
        e.target.reset(); // Vide le formulaire

    } catch (error) {
        console.error("Erreur publication:", error);
        alert("Erreur lors de la publication : " + error.message);
    } finally {
        // Dans tous les cas (succès ou erreur), on réactive le bouton
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

// 5. Supprimer un article
async function deleteArticle(id) {
    if(!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    
    const { error } = await supabaseClient.from('articles').delete().eq('id', id);
    
    if (error) {
        showToast("Erreur de suppression", "error");
    } else {
        showToast("Article supprimé", "success");
        loadAdminArticles();
    }
}
        /* --- AFFICHER LES ARTICLES ADMIN DANS LA MARKETPLACE --- */

async function loadMarketplaceArticles() {
    try {
        // 1. Récupérer les articles depuis Supabase
        const { data: articles, error } = await supabaseClient
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erreur chargement articles marketplace :", error);
            return;
        }

        if (!articles || articles.length === 0) return;

        // 2. Le conteneur où l'on va mettre les articles
        const grid = document.getElementById('products-grid');
        
        // 3. Créer le HTML pour chaque article
        articles.forEach(art => {
            // Définition des couleurs d'arrière-plan selon la catégorie (comme vos produits fixes)
            let bgClass = 'btn-sky-yellow'; 
            let iconClass = 'fas fa-newspaper text-slate-200';
            
            if (art.category === 'academique') {
                bgClass = 'bg-indigo-50'; iconClass = 'fas fa-graduation-cap text-indigo-200';
            } else if (art.category === 'corporate') {
                bgClass = 'bg-emerald-50'; iconClass = 'fas fa-briefcase text-emerald-200';
            } else if (art.category === 'marketing') {
                bgClass = 'bg-orange-50'; iconClass = 'fa-bullhorn text-orange-200';
            }

            // Création de la Carte
            const articleHTML = `
        <div class="market-item glass flex flex-col group overflow-hidden" data-category="${art.category || 'all'}">
            <div class="h-48 ${bgClass || 'bg-slate-100'} relative overflow-hidden">
                ${art.image_url 
                    ? `<img src="${art.image_url}" class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110">` 
                    : `<div class="absolute inset-0 flex items-center justify-center text-slate-300 text-5xl">
                         <i class="fas fa-image"></i>
                       </div>`
                }
                <span class="absolute top-4 left-4 btn-sky-yellow text-white text-[10px] font-bold px-2 py-1 rounded uppercase shadow-lg z-10">
                    Pub
                </span>
            </div>

            <div class="p-6 flex-1 flex flex-col">
                <h3 class="font-bold text-lg mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    ${art.title}
                </h3>
                
                <p class="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">
                    ${art.content ? art.content.replace(/<[^>]*>/g, '').substring(0, 80) + '...' : ''}
                </p>

                <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-400 italic">Détails</span>
                    <a href="javascript:void(0)" 
                       onclick="openTerminal()" 
                       class="w-10 h-10 rounded-full btn-sky-yellow text-white flex items-center justify-center hover:scale-110 transition-all shadow-md">
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    // Injection au début de la grille
    grid.insertAdjacentHTML('afterbegin', articleHTML);
    
    });

} catch (err) {
        console.error("Erreur marketplace :", err);
        
        // Rendu visuel de l'erreur pour l'utilisateur
        const grid = document.getElementById('products-grid'); // Remplacez par votre ID réel
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full flex flex-col items-center py-12 text-slate-400">
                    <i class="fas fa-exclamation-circle text-3xl mb-3 opacity-20"></i>
                    <p class="text-sm font-medium">Impossible de charger les produits pour le moment.</p>
                    <button onclick="location.reload()" class="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-500 underline uppercase tracking-widest">
                        Réessayer
                    </button>
                </div>
            `;
        }
        
        // Optionnel : Notification Toast
        if (typeof showToast === 'function') {
            showToast("Problème de connexion à la marketplace", "error");
        }
    }
}
       /**
 * Génère le HTML de l'avatar de manière élégante
 * @param {string} userEmail - Email de l'utilisateur pour les initiales et la couleur
 * @param {string} avatarUrl - URL optionnelle de la photo de profil
 * @param {boolean} isMe - Optionnel : permet de styliser différemment mon propre avatar
 */
function getAvatarHtml(userEmail, avatarUrl, isMe = false) {
    // 1. Si on a une URL d'image valide
    if (avatarUrl && avatarUrl.trim() !== '') {
        return `<img src="${avatarUrl}" class="w-full h-full object-cover rounded-full" onerror="this.parentElement.innerHTML='${getAvatarHtml(userEmail, null, isMe)}'">`;
    }
    
    // 2. Préparation des initiales
    const initials = userEmail && userEmail.includes('@') 
        ? userEmail.split('@')[0].substring(0, 2).toUpperCase() 
        : (userEmail ? userEmail.substring(0, 2).toUpperCase() : '??');

    // 3. Palette de couleurs "Modern Business" (plus sobres et pros)
    const colors = [
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#ec4899', // Rose
        '#3b82f6', // Bleu
        '#06b6d4', // Cyan
        '#10b981', // Emeraude
        '#f59e0b', // Ambre
        '#64748b'  // Ardoise
    ];

    // Génération d'un index de couleur constant pour le même utilisateur
    const charCodeSum = userEmail ? userEmail.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const colorIndex = charCodeSum % colors.length;
    const bgColor = colors[colorIndex];
    
    // 4. Retourne le span avec centrage Flexbox parfait
    return `
        <div class="w-full h-full flex items-center justify-center font-bold text-[11px] tracking-tighter rounded-full text-white shadow-inner" 
             style="background: linear-gradient(135deg, ${bgColor}CC, ${bgColor}); text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
            ${initials}
        </div>
    `;
}

/* --- METTRE À JOUR L'AVATAR DU DOCK --- */
function updateDockAvatar(avatarUrl) {
    const img = document.getElementById('dock-avatar-img');
    const icon = document.getElementById('dock-avatar-icon');
    
    if (!img || !icon) return;

    if (avatarUrl && avatarUrl.trim() !== '') {
        // Si on a une photo : on l'affiche et on cache l'icône
        img.src = avatarUrl;
        img.classList.remove('hidden');
        icon.classList.add('hidden');
    } else {
        // Si pas de photo : on cache l'image et on affiche l'icône
        img.classList.add('hidden');
        icon.classList.remove('hidden');
    }
}
        /* --- GESTION DE L'OUVERTURE DU CHAT (MODIFIÉ) --- */
/* --- GESTION DE L'OUVERTURE DU CHAT (CORRIGÉ POUR LE DOCK) --- */

window.toggleChat = async function() {
    const { data: authData } = await supabaseClient.auth.getUser();
    const user = authData?.user;

    if (!user) {
        showToast("Veuillez vous connecter pour accéder au chat", "error");
        return;
    }

    const overlay = document.getElementById('chat-overlay');
    const panel = document.getElementById('chat-panel');
    const dock = document.querySelector('.mobile-dock');
    
    if (!overlay || !panel) return;
    
    if (overlay.classList.contains('invisible')) {
        // --- OUVERTURE ---
        overlay.classList.remove('invisible');
        setTimeout(() => {
            overlay.querySelector('div:first-child').classList.replace('opacity-0', 'opacity-100');
            panel.classList.replace('translate-x-full', 'translate-x-0');
        }, 10);

        loadChatMessages();
        if (!chatInterval) chatInterval = setInterval(loadChatMessages, 3000);

        // --- CACHER LE DOCK ---
        if (dock) dock.classList.add('dock-hidden');

        setTimeout(() => {
            const input = document.getElementById('chat-input');
            if (input) input.focus();
        }, 500);
    } else {
        // --- FERMETURE ---
        overlay.querySelector('div:first-child').classList.replace('opacity-100', 'opacity-0');
        panel.classList.replace('translate-x-0', 'translate-x-full');
        setTimeout(() => overlay.classList.add('invisible'), 500);

        if (chatInterval) {
            clearInterval(chatInterval);
            chatInterval = null;
        }

        // --- RÉAFFICHER LE DOCK ---
        if (dock) dock.classList.remove('dock-hidden');
    }
};

async function loadChatMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const { data: authData } = await supabaseClient.auth.getUser();
    const user = authData?.user;
    if(!user) return;

    const { data: messages, error } = await supabaseClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

    if (error) return console.error("Erreur chat:", error);
    if (container.querySelectorAll('.chat-row').length === messages.length) return;

    container.innerHTML = '<div class="text-center my-6"><span class="inline-block bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-100">Discussion en direct</span></div>';

    messages.forEach(msg => {
        const isMe = msg.user_id === user.id;
        const row = document.createElement('div');
        row.className = `chat-row ${isMe ? 'flex-row-reverse' : 'flex-row'}`;
        
        const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
        const name = isMe ? 'Moi' : (msg.user_email?.split('@')[0] || 'Anonyme');

        row.innerHTML = `
            <div class="chat-avatar shadow-md border-2 ${isMe ? 'border-indigo-100' : 'border-white'}">
                ${getAvatarHtml(msg.user_email, null, isMe)}
            </div>
            <div class="chat-content ${isMe ? 'items-end' : 'items-start'}">
                <div class="chat-header ${isMe ? 'flex-row-reverse text-indigo-100' : 'text-indigo-600'}">
                    <span>${name}</span>
                    <span class="opacity-60 font-normal">${time}</span>
                </div>
                <div class="chat-bubble ${isMe ? 'me' : 'other'} shadow-sm">
                    ${msg.content}
                </div>
            </div>`;
        container.appendChild(row);
    });

    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}

/* --- GESTION DES BADGES (ADMIN) --- */

async function loadAdminUsers() {
    const list = document.getElementById('admin-users-list');
    if (!list) return;

    const { data: profiles, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        list.innerHTML = `<tr><td colspan="4">Erreur: ${error.message}</td></tr>`;
        return;
    }

    list.innerHTML = profiles.map(p => {
        const isCert = Boolean(p.is_certified);
        return `
        <tr class="hover:bg-slate-50 border-b border-slate-100">
            <td class="px-6 py-4 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full overflow-hidden border shadow-sm">
                     ${p.avatar_url ? `<img src="${p.avatar_url}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><i class="fas fa-user text-xs"></i></div>`}
                </div>
                <span class="font-bold text-slate-900">${p.full_name || 'Sans nom'}</span>
            </td>
            <td class="px-6 py-4 text-slate-500 text-xs">${p.email || 'N/A'}</td>
            <td class="px-6 py-4 text-center">
                ${isCert ? '<span class="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold"><i class="fas fa-check-circle"></i> Certifié</span>' : '<span class="text-slate-400 text-xs">Standard</span>'}
            </td>
            <td class="px-6 py-4 text-center">
                <button onclick="toggleUserBadge('${p.id}', ${isCert})" class="px-3 py-1 text-xs font-bold border rounded ${isCert ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}">
                    ${isCert ? 'Révoquer' : 'Certifier'}
                </button>
            </td>
        </tr>`;
    }).join('');
}

async function toggleUserBadge(userId, currentStatus) {
    const newStatus = !currentStatus;
    const { error } = await supabaseClient.from('profiles').update({ is_certified: newStatus, certification_badge: newStatus ? 'Vérifié' : null }).eq('id', userId);

    if (error) {
        showToast("Erreur: " + error.message, "error");
    } else {
        showToast(newStatus ? "Utilisateur certifié !" : "Badge révoqué.", "success");
        loadAdminUsers();
    }
}

/* --- MISE À JOUR DU JS POUR LE NOUVEAU DESIGN --- */

/* --- CHARGEMENT PROFIL (OPTIMISÉ) --- */
async function loadSocialProfile(targetUserId = null) {
    try {
        const { data: { user: currentUser }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !currentUser) return;

        let profileId = targetUserId || currentUser.id;
        let isMyProfile = (profileId === currentUser.id);

        // 1. Charger le profil
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .maybeSingle();

        if (error) throw error;

        if (!profile) {
            const container = document.querySelector('#profile-social-view .max-w-2xl'); 
            if (container) container.innerHTML = `<div class="text-center py-20"><h2 class="text-xl font-bold text-slate-900">Profil introuvable</h2></div>`;
            return;
        }

        // 2. Mise à jour du DOM de base
        const updateText = (id, text) => {
            const el = document.getElementById(id);
            if(el) el.textContent = text;
        };

        updateText('social-fullname', profile.full_name || 'Utilisateur');
        updateText('social-username', profile.username ? `@${profile.username}` : '@utilisateur');

        // 3. Stats (Optimisation : Lancement des deux requêtes en même temps)
        const [followersRes, followingRes] = await Promise.all([
            supabaseClient.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileId),
            supabaseClient.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileId)
        ]);
        
        // 4. Gestion des éléments UI
        const editBtn = document.querySelector('button[onclick="toggleProfile()"]');
        const logoutBtn = document.querySelector('button[onclick="confirmSocialLogout()"]');
        const followContainer = document.getElementById('profile-follow-container');

        if (isMyProfile) {
            if(editBtn) editBtn.style.display = 'inline-block';
            if(logoutBtn) logoutBtn.style.display = 'flex';
            if(followContainer) {
                followContainer.style.display = 'none';
                followContainer.innerHTML = ''; 
            }
            updateDockAvatar(profile.avatar_url);
        } else {
            if(editBtn) editBtn.style.display = 'none';
            if(logoutBtn) logoutBtn.style.display = 'none';
            
            if (followContainer) {
                followContainer.style.display = 'flex';
                followContainer.innerHTML = ''; // On vide pour laisser la fonction suivante remplir
                
                // Appel de ta fonction de création de boutons (Abonnement + Message)
                // Assure-toi que cette fonction utilise followContainer pour injecter le HTML
                await initFollowButtonOnProfile(profileId, currentUser.id); 
            }
        }

        // 5. Avatar principal (Correction fallback)
        const imgEl = document.getElementById('social-avatar');
        const placeholder = document.getElementById('social-avatar-placeholder');
        
        if (imgEl && placeholder) {
            if (profile.avatar_url) {
                imgEl.src = profile.avatar_url;
                imgEl.classList.remove('hidden');
                placeholder.classList.add('hidden');
            } else {
                imgEl.classList.add('hidden');
                placeholder.classList.remove('hidden');
                // Optionnel : Mettre une initiale dans le placeholder
                placeholder.innerText = (profile.full_name || 'U').charAt(0).toUpperCase();
            }
        }

        // 6. Badge de certification
        const badgeInline = document.getElementById('social-badge-inline');
        if(badgeInline) {
            profile.is_certified ? badgeInline.classList.remove('hidden') : badgeInline.classList.add('hidden');
        }

        // 7. Charger les posts du profil
        loadSocialPosts(profileId);

    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error("Erreur profil social:", err);
    loadSocialPosts(userId);
        }
    }
}

async function initFollowButtonOnProfile(targetUserId, myId) {
    const container = document.getElementById('profile-follow-container');
    if (!container) return;

    // 1. Sécurité : On définit cleanMyId proprement
    let cleanMyId = (typeof myId === 'object' && myId !== null) ? myId.id : myId;
    
    // Si cleanMyId est toujours invalide, on le récupère via la session
    if (!cleanMyId || typeof cleanMyId !== 'string') {
        const { data: { user } } = await supabaseClient.auth.getUser();
        cleanMyId = user?.id;
    }

    if (!cleanMyId || !targetUserId) return;

    try {
        // 2. Vérification de l'abonnement
        const { data: followCheck } = await supabaseClient
            .from('follows')
            .select('*')
            .eq('follower_id', cleanMyId)
            .eq('following_id', targetUserId)
            .maybeSingle();

        const isFollowing = !!followCheck;

        // 3. Rendu HTML (Bouton Follow + Bouton Message)
        container.style.display = 'flex';
        container.className = "flex items-center gap-2 w-full mt-4";
        
        container.innerHTML = `
            <button id="main-follow-btn" 
                onclick="toggleFollow('${targetUserId}', this)" 
                class="flex-1 text-xs font-bold px-6 py-2.5 rounded-full transition-all active:scale-95 ${
                    isFollowing 
                    ? 'bg-slate-100 text-slate-600 border border-slate-200' 
: 'btn-sky-yellow shadow-md'
                }">
                ${isFollowing ? 'Abonné' : 'S\'abonner'}
            </button>
            
            <button onclick="startChat('${targetUserId}')" 
                class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-all active:scale-90 shadow-sm border border-indigo-100">
                <i class="fas fa-comment-dots"></i>
            </button>
        `;
    } catch (err) {
        console.error("Erreur initFollowButton:", err);
    }
}

// 3. Chargement des Photos (Grille 3 colonnes)
// 3. Chargement des Photos (Grille 3 colonnes) - VERSION CORRIGÉE
async function loadSocialPosts(userId) {
    const grid = document.getElementById('social-posts-grid');
    if (!grid) return;

    try {
        // --- CORRECTION : Récupération de l'utilisateur connecté (myId) ---
        const { data: { user } } = await supabaseClient.auth.getUser();
        const myId = user?.id || null; // Si pas connecté, myId est null

        // Récupération des posts du profil visité
        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!posts || posts.length === 0) {
            grid.innerHTML = `
                <div class="col-span-3 flex flex-col items-center justify-center py-20 text-gray-400">
                    <i class="fas fa-camera text-3xl mb-2"></i>
                    <p class="text-xs">Aucune publication</p>
                </div>`;
            return;
        }

        // Génération HTML pour la grille (carrés parfaits)
        grid.innerHTML = posts.map(post => {
            // Logique de confidentialité (Optionnel : masquer les posts privés si ce n'est pas le propriétaire)
            if (post.visibility === 'private' && myId !== userId) {
                return ''; // Ne pas afficher les posts privés des autres
            }
            
            // Déterminer le média (Image ou Vidéo)
            const mediaUrl = post.image_url || post.video_url;
            const isVideo = post.is_short || post.video_url;

            return `
            <div class="aspect-square bg-gray-200 relative group cursor-pointer overflow-hidden" onclick="openPostModal('${post.id}')">
                ${mediaUrl 
                    ? (isVideo 
                        ? `<video src="${mediaUrl}" class="w-full h-full object-cover" muted></video>
                           <div class="absolute top-2 right-2 text-white drop-shadow-lg"><i class="fas fa-play-circle"></i></div>`
                        : `<img src="${mediaUrl}" decoding="async" class="w-full h-full object-cover" loading="lazy">`
                      )
                    : `<div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><i class="fas fa-image text-2xl"></i></div>`
                }
                <!-- Overlay au survol (Style Instagram) -->
                <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-sm font-bold">
                    ${post.image_url ? `<span class="flex items-center gap-1"><i class="fas fa-heart"></i> 0</span>` : '<i class="fas fa-play fa-2x"></i>'}
                </div>
            </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Erreur posts:", err);
    }
}

// 4. Gestion de la Modale de Publication
function openNewPostModal() { 
    // Afficher la modale
    const modal = document.getElementById('new-post-modal');
    if (modal) modal.classList.remove('hidden'); 

    // NOUVEAU : Cacher le Dock mobile pour libérer l'espace
    const dock = document.querySelector('.mobile-dock');
    if (dock) dock.classList.add('nav-hidden');
}

function closeNewPostModal() { 
    // Cacher la modale
    const modal = document.getElementById('new-post-modal');
    if (modal) modal.classList.add('hidden'); 

    // NOUVEAU : Réafficher le Dock mobile
    const dock = document.querySelector('.mobile-dock');
    if (dock) dock.classList.remove('nav-hidden');
}


        
// --- GESTION DU TYPE DE POST (IMAGE / SHORT) ---

let currentPostFile = null; // Stocke le fichier (image ou vidéo)

function setPostType(type) {
    const imgBox = document.getElementById('upload-image-box');
    const vidBox = document.getElementById('upload-video-box');
    const btnImg = document.getElementById('btn-type-image');
    const btnVid = document.getElementById('btn-type-short');
    const hiddenInput = document.getElementById('current-post-type');

    hiddenInput.value = type;
    currentPostFile = null; // Reset file
    resetPreview();

    if (type === 'image') {
        imgBox.classList.remove('hidden');
        vidBox.classList.add('hidden');
        btnImg.className = "flex-1 py-2 text-xs font-bold rounded-md bg-white shadow-sm text-slate-900 transition";
        btnVid.className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-500 hover:text-slate-900 transition";
    } else {
        imgBox.classList.add('hidden');
        vidBox.classList.remove('hidden');
        btnImg.className = "flex-1 py-2 text-xs font-bold rounded-md text-slate-500 hover:text-slate-900 transition";
        btnVid.className = "flex-1 py-2 text-xs font-bold rounded-md bg-pink-50 shadow-sm text-pink-600 transition";
    }
}

function previewFile(input, type) {
    const file = input.files[0];
    if (!file) return;
    
    const errorMsg = document.getElementById('video-error-msg');
    const previewArea = document.getElementById('preview-area');
    const imgEl = document.getElementById('preview-img-el');
    const vidEl = document.getElementById('preview-video-el');

    errorMsg.classList.add('hidden');
    currentPostFile = file;
    previewArea.classList.remove('hidden');

    if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
            imgEl.src = e.target.result;
            imgEl.classList.remove('hidden');
            vidEl.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        // LOGIQUE VIDÉO : Vérifier la durée MAX 10 MIN
        const videoURL = URL.createObjectURL(file);
        vidEl.src = videoURL;
        
        vidEl.onloadedmetadata = function() {
            if (this.duration > 600) { // 600 secondes = 10 minutes
                errorMsg.innerText = "Erreur : La vidéo dépasse 10 minutes !";
                errorMsg.classList.remove('hidden');
                input.value = ""; // Reset
                currentPostFile = null;
                previewArea.classList.add('hidden');
            } else {
                // Durée OK
                vidEl.classList.remove('hidden');
                imgEl.classList.add('hidden');
            }
        };
    }
}

function resetPreview() {
    document.getElementById('preview-area').classList.add('hidden');
    document.getElementById('preview-img-el').src = '';
    document.getElementById('preview-video-el').src = '';
}// <--- C'est cette accolade qui ferme la fonction

        async function filterFeed(filter) {
    // Mise à jour visuelle des boutons
    const btnRecent = document.getElementById('btn-sort-recent');
    const btnPopular = document.getElementById('btn-sort-popular');
    const btnShorts = document.getElementById('btn-filter-shorts');

    // Reset classes
    [btnRecent, btnPopular, btnShorts].forEach(btn => {
        btn.className = "text-sm font-bold pb-2 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap";
    });

    // Active class pour le bouton cliqué
    if (filter === 'shorts') {
        btnShorts.className = "text-sm font-bold pb-2 px-2 border-b-2 border-pink-600 text-pink-600 transition-colors whitespace-nowrap flex items-center gap-1";
    } else if (filter === 'recent') {
        btnRecent.className = "text-sm font-bold pb-2 px-2 border-b-2 border-indigo-600 text-indigo-600 transition-colors whitespace-nowrap";
    } else if (filter === 'popular') {
        btnPopular.className = "text-sm font-bold pb-2 px-2 border-b-2 border-indigo-600 text-indigo-600 transition-colors whitespace-nowrap flex items-center gap-1";
    }

    // Charger le feed avec le filtre
    loadGlobalFeed('recent', filter);
}

        /* --- FONCTION DÉCONNEXION SOCIALE --- */
function confirmSocialLogout() {
    // 1. Demander confirmation
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        
        // 2. Appeler Supabase pour déconnecter
        supabaseClient.auth.signOut().then(({ error }) => {
            if (error) {
                console.error("Erreur déconnexion:", error.message);
                showToast("Erreur lors de la déconnexion", "error");
            } else {
                // 3. Rediriger vers la page de login
                showToast("Déconnexion !", "success");
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            }
        });
    }
}

        /* --- ALGORITHME DE TRI DES POSTS --- */

// Fonction pour calculer le score d'un post
function calculatePostScore(likes, comments, createdAt) {
    // 1. Score d'engagement (1 Like = 10pts, 1 Comment = 5pts)
    const engagementScore = (likes * 10) + (comments * 5);
    
    // 2. Calcul du temps écoulé (en heures)
    const now = new Date();
    const postDate = new Date(createdAt);
    const diffTime = Math.abs(now - postDate);
    const diffHours = diffTime / (1000 * 60 * 60);

    // 3. Formule de désintégration temporelle (Gravity)
    // Plus diffHours est grand, plus le dénominateur est grand, donc le score baisse.
    const gravity = 1.8;
    const timeDecay = Math.pow(diffHours + 2, gravity);

    // 4. Score final
    return engagementScore / timeDecay;
}

// Fonction de tri principal
// Fonction pour le TRI (Tendances)
function sortFeed(type) {
    // Mise à jour visuelle des boutons
    const btnRecent = document.getElementById('btn-sort-recent');
    const btnPopular = document.getElementById('btn-sort-popular');

    // Reset des styles
    if(btnRecent) { btnRecent.className = "text-sm font-bold pb-2 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap"; }
    if(btnPopular) { btnPopular.className = "text-sm font-bold pb-2 px-2 border-b-2 border-transparent text-slate-400 hover:text-slate-600 transition-colors whitespace-nowrap"; }

    // Activation du style du bouton cliqué
    if (type === 'popular') {
        if(btnPopular) btnPopular.className = "text-sm font-bold pb-2 px-2 border-b-2 border-indigo-600 text-indigo-600 transition-colors whitespace-nowrap flex items-center gap-1";
    } else {
        if(btnRecent) btnRecent.className = "text-sm font-bold pb-2 px-2 border-b-2 border-indigo-600 text-indigo-600 transition-colors whitespace-nowrap";
    }

    // --- LOGIQUE DE CHARGEMENT ---
    // Si on clique sur Tendances, on trie par popularité
    // Sinon on trie par Récent
    const sortMode = (type === 'popular') ? 'popular' : 'recent';
    
    // On recharge le feed avec le tri voulu (appendMode = false pour reset)
    loadGlobalFeed(sortMode, 'all', false);
}

// Fonction pour le FILTRE (Shorts)
function filterFeed(filterType) {
    const btnShorts = document.getElementById('btn-filter-shorts');
    
    // Reset style bouton Shorts
    if(btnShorts) btnShorts.className = "text-sm font-bold pb-2 px-2 border-b-2 border-transparent text-slate-400 hover:text-pink-600 transition-colors whitespace-nowrap flex items-center gap-1";

    // Activation style
    if (filterType === 'shorts') {
        if(btnShorts) btnShorts.className = "text-sm font-bold pb-2 px-2 border-b-2 border-pink-600 text-pink-600 transition-colors whitespace-nowrap flex items-center gap-1";
        
        // --- LOGIQUE DE CHARGEMENT ---
        // On charge le feed en filtrant uniquement les vidéos
        loadGlobalFeed('recent', 'shorts', false);
    }
}
        
/**
 * CHARGEMENT DU FLUX GLOBAL (VERSION ULTRA PRO)
 */
async function loadGlobalFeed(sortBy = 'recent', filterType = 'all', appendMode = false) {
    const container = document.getElementById('global-feed-container');
    const loader = document.getElementById('feed-loader');
    if (!container) return;

    // --- 1. GESTION DU LOADER ET PAGINATION ---
    if (!appendMode) {
        container.innerHTML = `<div class="flex justify-center py-12"><i class="fas fa-circle-notch animate-spin text-3xl text-indigo-600 opacity-20"></i></div>`;
        feedOffset = 0;
        hasMorePosts = true;
    } else {
        if (loader) loader.classList.remove('hidden');
    }

    if (appendMode) isLoadingFeed = true;

    try {
        // --- 2. AUTHENTIFICATION & DATA INIT ---
        const { data: userData } = await supabaseClient.auth.getUser();
        const myId = userData?.user?.id || null;
        
        // B. Récupération de mes abonnements (Pour la confidentialité "Friends")
        let myFollowingSet = new Set();
        if (myId) {
            const { data: followingData } = await supabaseClient
                .from('follows')
                .select('following_id')
                .eq('follower_id', myId);
            if (followingData) myFollowingSet = new Set(followingData.map(f => f.following_id));
        }

        // --- 3. RÉCUPÉRATION DES POSTS (Query principale) ---
        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select(`
                *,
                profiles ( id, full_name, username, avatar_url, is_certified ),
                post_likes(count),
                post_comments(count)
            `)
            .order('created_at', { ascending: false })
            .range(feedOffset, feedOffset + FEED_BATCH_SIZE - 1);

        if (error) throw error;

        if (!posts || posts.length === 0) {
            if (!appendMode) {
                container.innerHTML = `<div class="text-center py-20 text-slate-400"><i class="fas fa-newspaper text-4xl mb-3 opacity-20"></i><p>Aucune publication pour le moment.</p></div>`;
            } else {
                hasMorePosts = false;
                if (loader) loader.classList.add('hidden');
            }
            return;
        }

        // --- 4. FILTRAGE CÔTÉ CLIENT (Confidentialité & Blocage) ---
        const visiblePosts = posts.filter(post => {
            if (post.user_id === myId) return true;

            const visibility = post.visibility || 'public';

            if (visibility === 'public') return true;
            if (visibility === 'private') return false;
            
            if (visibility === 'friends') {
                return myFollowingSet.has(post.user_id);
            }
            return false;
        });

        // --- 5. RÉACTIONS UTILISATEUR ---
        let myLikedPostIds = new Set();
        const postIds = visiblePosts.map(p => p.id);

        if (myId && postIds.length > 0) {
            const { data: myLikes } = await supabaseClient
                .from('post_likes')
                .select('post_id, reaction_type')
                .eq('user_id', myId)
                .in('post_id', postIds);

            if (myLikes) {
                myLikedPostIds = new Set(myLikes.map(l => l.post_id));
                if (typeof userReactions !== 'undefined') {
                    myLikes.forEach(like => {
                        userReactions.set(like.post_id, like.reaction_type);
                    });
                }
            }
        }

        // --- 6. FILTRE SECONDaire (Shorts) & TRI ---
        let processedPosts = filterType === 'shorts' ? visiblePosts.filter(p => p.is_short) : visiblePosts;

        if (sortBy === 'popular' && typeof calculatePostScore === 'function') {
            processedPosts = processedPosts.map(post => ({
                ...post,
                calculatedScore: calculatePostScore(post.post_likes?.[0]?.count || 0, post.post_comments?.[0]?.count || 0, post.created_at)
            })).sort((a, b) => b.calculatedScore - a.calculatedScore);
        }

        // --- 7. GÉNÉRATION HTML (AVEC DOCUMENTFRAGMENT) ---
        // Création d'un fragment mémoire (hors DOM) pour optimiser le rendu
        const fragment = document.createDocumentFragment();

        processedPosts.forEach(post => {
            const profile = post.profiles || {};
            const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'user'}`; 
            const userName = profile.full_name || 'Utilisateur';
            const isCertified = profile.is_certified;
            const timeAgo = typeof getTimeAgo === 'function' ? getTimeAgo(new Date(post.created_at)) : 'Récemment';
            
            const likeCount = post.post_likes?.[0]?.count || 0;
            const commentCount = post.post_comments?.[0]?.count || 0;
            const isMyPost = (post.user_id === myId);

            let formattedCaption = "";
            if (post.caption) {
                formattedCaption = typeof formatTextWithHighlights === 'function' ? formatTextWithHighlights(post.caption) : post.caption;
            }

            // Bouton Suivre
            let followBtn = '';
            if (!isMyPost && myId) {
                const isFollowing = myFollowingSet.has(post.user_id);
                followBtn = `
                    <button onclick="toggleFollow('${post.user_id}', this)" 
                            class="text-xs font-bold px-4 py-1.5 rounded-full transition-all ${isFollowing ? 'border border-slate-200 text-slate-500' : 'btn-sky-yellow text-white hover:bg-indigo-700 shadow-sm'}">
                        ${isFollowing ? 'Abonné' : 'Suivre'}
                    </button>`;
            }

            // Menu Contextuel
            let menuItemsHtml = '';
            if (isMyPost) {
                menuItemsHtml = `
                    <div onclick="editPost('${post.id}')" class="post-dropdown-item"><i class="fas fa-pencil-alt"></i> Modifier</div>
                    <div onclick="deletePostModal('${post.id}')" class="post-dropdown-item danger"><i class="fas fa-trash-alt"></i> Supprimer</div>`;
            } else {
                menuItemsHtml = `
                    <div onclick="savePost('${post.id}')" class="post-dropdown-item"><i class="far fa-bookmark"></i> Enregistrer</div>
                    <div onclick="sharePost('${post.id}')" class="post-dropdown-item"><i class="fas fa-link"></i> Copier le lien</div>
                    <div onclick="reportPost('${post.id}')" class="post-dropdown-item danger"><i class="fas fa-flag"></i> Signaler</div>`;
            }

            // Média HTML
            let mediaHtml = '';
            if (post.is_short && post.video_url) {
                mediaHtml = `
                    <div onclick="openPostModal('${post.id}')" class="relative bg-slate-900 flex justify-center overflow-hidden group rounded-2xl mb-4 shadow-lg border border-slate-200/10 cursor-pointer" 
                         onmouseenter="if(this.querySelector('video')) this.querySelector('video').play()"
                         onmouseleave="if(this.querySelector('video')) { this.querySelector('video').pause(); this.querySelector('video').currentTime = 0; }">
                        <div class="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[10px] font-bold tracking-wider uppercase">
                            <i class="fas fa-bolt text-yellow-400"></i> Short
                        </div>
                        <video src="${post.video_url}" class="w-full aspect-[9/16] max-h-[650px] object-cover transition-transform duration-700 group-hover:scale-105" loop muted playsinline preload="metadata"></video>
                        <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div class="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-2xl">
                                <i class="fas fa-expand text-2xl"></i>
                            </div>
                        </div>
                    </div>`;
            } else if (post.image_url) {
                mediaHtml = `<img src="${post.image_url}" onclick="openPostModal('${post.id}')" class="w-full h-auto object-cover rounded-lg mb-1 cursor-pointer hover:opacity-95 transition" loading="lazy" alt="Post">`;
            }

            // Création de l'élément Article (Node DOM)
            const article = document.createElement('article');
            article.className = 'bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-lg overflow-hidden mb-2 transition-all hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5';
            
            // Injection du HTML dans le node (Design préservé)
            article.innerHTML = `
                <div class="p-4 flex items-center justify-between">
                    <div class="flex items-center gap-3 cursor-pointer" onclick="viewUserProfile('${post.user_id}')">
                        <img src="${avatarUrl}" class="w-11 h-11 rounded-full border-2 border-indigo-50 shadow-sm">
                        <div>
                            <div class="flex items-center gap-1 font-bold text-sm text-slate-900 dark:text-white">
                                ${userName} ${isCertified ? '<i class="fas fa-check-circle text-blue-500 text-[10px]"></i>' : ''}
                            </div>
                            <div class="text-[11px] text-slate-400 font-medium">${timeAgo}</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        ${followBtn}
                        <div class="post-menu-container ml-1">
                            <button onclick="togglePostMenu('${post.id}', event)" class="w-25 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90">
                                <i class="fas fa-ellipsis-v text-[18px] text-black dark:text-white"></i>
                            </button>
                            <div id="menu-${post.id}" class="post-dropdown-menu">${menuItemsHtml}</div>
                        </div>
                    </div>
                </div>
                <div class="px-4 pb-2">
                    ${formattedCaption ? `<div><p id="caption-${post.id}" class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2"><span class="font-extrabold text-slate-900 dark:text-white"></span>${formattedCaption}</p>${formattedCaption.length > 50 ? `<span id="btn-more-${post.id}" onclick="toggleCaptionExpand('${post.id}')" class="btn-voir-plus">Voir plus</span>` : ''}</div>` : ''}
                </div>
                ${mediaHtml}
                <div class="px-4 pb-2 pt-1">
                    <div class="flex items-center gap-5">
                        <div style="position: relative;">
                            <button onclick="toggleReactionPopup('${post.id}', this)" class="flex items-center gap-1.5 group">
                                <i id="icon-react-${post.id}" class="text-xl group-active:scale-125 transition-transform ${
                                    (() => {
                                        const type = userReactions.get(post.id);
                                        const style = type ? REACTION_STYLES[type] : null;
                                        return style ? `fas ${style.icon} ${style.color}` : 'far fa-heart text-slate-400';
                                    })()
                                }"></i>
                                <span id="count-like-${post.id}" class="text-xs font-bold text-slate-500">${formatNumber(likeCount)}</span>
                            </button>
                            <div id="reactions-popup-${post.id}" class="reactions-popup" style="display:none"></div>
                        </div>
                        <button onclick="toggleCommentSection('${post.id}')" class="flex items-center gap-1.5 group">
                            <i class="fas fa-comment-dots text-slate-400 text-xl group-hover:text-indigo-500 transition-colors"></i>
                            <span id="count-comment-${post.id}" class="text-xs font-bold text-slate-500">${formatNumber(commentCount)}</span>
                        </button>
                        <button onclick="sharePost('${post.id}')" class="ml-auto text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1">
                            <i class="fas fa-arrows-rotate text-xl"></i>
                        </button>
                    </div>
                </div>
                <div id="comments-${post.id}" class="hidden p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div id="comment-list-${post.id}" class="space-y-3 mb-4 max-h-48 overflow-y-auto no-scrollbar"></div>
                    <form onsubmit="submitComment(event, '${post.id}')" class="relative">
                        <input type="text" name="content" placeholder="Ajouter un commentaire..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                        <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 btn-sky-yellow px-3 py-1 rounded-full text-xs font-bold">Envoyer</button>
                    </form>
                </div>`;

            // Ajout de l'article au fragment (en mémoire, pas encore visible)
            fragment.appendChild(article);
        });

        // --- 8. INJECTION DOM (UNE SEULE FOIS) ---
        
        // Si on remplace tout (pas appendMode), on vide le container
        if (!appendMode) {
            container.innerHTML = '';
        }
        
        // On injecte tout le fragment d'un coup (Ultra performant)
        container.appendChild(fragment);

        // Gestion du scroll infini
        feedOffset += posts.length;
        
        if (processedPosts.length === 0 && posts.length === FEED_BATCH_SIZE) {
             loadMoreFeed(); 
             return;
        }

        if (posts.length < FEED_BATCH_SIZE) {
            hasMorePosts = false;
            if (loader) loader.classList.add('hidden');
        }

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error("Erreur Feed:", error);
            if (!appendMode) {
                container.innerHTML = `<div class="p-8 text-center bg-red-50 text-red-600 rounded-2xl"><i class="fas fa-exclamation-triangle mb-2 text-xl"></i><p class="text-sm font-bold">Verifier votre connexion</p></div>`;
            }
        }
    } finally {
        isLoadingFeed = false;
        if (loader && !hasMorePosts) loader.classList.add('hidden');
        else if (loader) loader.classList.remove('hidden');
    }
}

            // 1. Ouvrir/Fermer le menu spécifique
function togglePostMenu(postId, event) {
    event.stopPropagation(); // Empêche le clic de se propager
    const menu = document.getElementById(`menu-${postId}`);
    const isVisible = menu.style.display === 'block';

    // Fermer tous les autres menus ouverts
    document.querySelectorAll('.post-dropdown-menu').forEach(m => m.style.display = 'none');

    // Basculer l'affichage du menu actuel
    if (!isVisible) {
        menu.style.display = 'block';
    }
}

// 2. Fermer le menu si on clique ailleurs sur la page
document.addEventListener('click', () => {
    document.querySelectorAll('.post-dropdown-menu').forEach(m => m.style.display = 'none');
});

// 3. Fonction pour "Enregistrer" (placeholder)
async function savePost(postId) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return showToast("Connectez-vous", "error");

    // Vérifier si déjà enregistré
    const { data: existing } = await supabaseClient
        .from('saved_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

    if (existing) {
        // Supprimer
        await supabaseClient.from('saved_posts').delete().eq('id', existing.id);
        showToast("Retiré des enregistrements", "success");
    } else {
        // Ajouter
        await supabaseClient.from('saved_posts').insert([{ user_id: user.id, post_id: postId }]);
        showToast("Post enregistré !", "success");
    }
    
    // Mettre à jour l'icône visuellement (Optionnel)
    const btn = document.querySelector(`[onclick="savePost('${postId}')"] i`);
    if (btn) btn.classList.toggle('fas'); // Change l'icône en plein
}
        // Fonction déclenchée par l'observateur quand on arrive en bas
async function loadMoreFeed() {
    if (isLoadingFeed || !hasMorePosts) return;
    
    // On réutilise les filtres actuels (ou 'recent' par défaut)
    // On passe 'true' pour le mode append (ajout)
    await loadGlobalFeed('recent', 'all', true);
}
        
function initVideoObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                if (!video.src && video.dataset.src) video.src = video.dataset.src;
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.lazy-video').forEach(v => observer.observe(v));
}

function toggleCommentSection(postId) {
    const commentSection = document.getElementById(`comments-${postId}`);
    
    if (commentSection) {
        // On bascule la classe 'hidden' pour afficher ou cacher la section
        commentSection.classList.toggle('hidden');
        
        // Petit bonus : si on ouvre la section, on scrolle doucement vers elle
        if (!commentSection.classList.contains('hidden')) {
            commentSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}
        
        /* --- ACTIONS : LIKE, COMMENT, SHARE --- */

// 1. Gérer le Like
// 1. LIKE : Optimisé et robuste
// 1. Gérer le Like
// Variable pour empêcher le spamming de clics
const likeLocks = new Set();

async function toggleLike(postId, btnElement) {
    // Empêche le double-clic
    if (likeLocks.has(postId)) return;

    const icon = document.getElementById(`icon-like-${postId}`);
    const countSpan = document.getElementById(`count-like-${postId}`);
    
    if (!icon || !countSpan) return;

    try {
        // Vérification utilisateur
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            showToast("Connectez-vous pour liker", "warning");
            return;
        }

        // --- CALCUL INTELLIGENT DU NOMBRE ACTUEL ---
        // 1. On essaie de lire l'attribut caché (le plus fiable)
        let currentCount = parseInt(countSpan.getAttribute('data-raw-count'));

        // 2. SECURITE : Si l'attribut est absent (null), on lit le texte affiché à l'écran
        if (isNaN(currentCount)) {
            const textVisible = countSpan.innerText || "0";
            // Si le texte contient "K" (ex: 1.2K), on convertit en chiffre
            if (textVisible.includes('K')) {
                currentCount = parseFloat(textVisible) * 1000;
            } else {
                // Sinon on prend le chiffre brut
                currentCount = parseInt(textVisible.replace(/[^0-9]/g, '')) || 0;
            }
        }

        // 3. Logique de changement d'état
        const isCurrentlyLiked = icon.classList.contains('fas');
        
        if (isCurrentlyLiked) {
            // ON RETIRE LE LIKE
            icon.classList.replace('fas', 'far');
            icon.classList.remove('text-red-500', 'animate-heart-pop');
            currentCount = Math.max(0, currentCount - 1);
        } else {
            // ON MET UN LIKE
            icon.classList.replace('far', 'fas');
            icon.classList.add('text-red-500', 'animate-heart-pop');
            currentCount += 1;
        }
        
        // 4. Mise à jour visuelle IMMEDIATE
        countSpan.innerText = formatNumber(currentCount);
        // On met à jour l'attribut caché pour la prochaine fois
        countSpan.setAttribute('data-raw-count', currentCount);

        // 5. Action en Base de Données
        if (isCurrentlyLiked) {
            await supabaseClient
                .from('post_likes')
                .delete()
                .match({ post_id: postId, user_id: user.id });
        } else {
            await supabaseClient
                .from('post_likes')
                .insert([{ post_id: postId, user_id: user.id }]);
        }

    } catch (err) {
        console.error("Erreur Like:", err);
        // On ne fait rien de visuel, l'état optimiste reste
    } finally {
        likeLocks.delete(postId);
    }
}

// 2. COMMENTAIRE : Corrigé
async function submitComment(e, postId) {
    e.preventDefault();
    const form = e.target;
    const content = form.content.value.trim();
    const listElement = document.getElementById(`comment-list-${postId}`);
    const countSpan = document.getElementById(`count-comment-${postId}`);

    // --- VÉRIFICATION CONTENU ---
    if (containsInappropriateContent(content)) {
        showToast("Commentaire refusé : Langage inapproprié.", "error");
        if(input) {
            input.classList.add('border-red-500', 'bg-red-50');
            setTimeout(() => input.classList.remove('border-red-500', 'bg-red-50'), 2000);
        }
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient
        .from('post_comments')
        .insert([{ user_id: user.id, post_id: postId, content: content }]);

    if (!error) {
        // Ajout visuel
        const newComment = document.createElement('div');
        newComment.className = 'text-sm animate-fade-in'; // Petite animation si tu as le CSS
        newComment.innerHTML = `<span class="font-bold text-indigo-700">Vous</span> <span class="text-slate-600">${content}</span>`;
        listElement.appendChild(newComment);
        form.reset();
        
        // Mise à jour du compteur
        let rawText = countSpan.innerText.toUpperCase().replace(',', '.');
        let currentCount = rawText.includes('K') ? parseFloat(rawText) * 1000 : parseInt(rawText);
        countSpan.innerText = formatNumber(currentCount + 1);
    } else {
        console.error("Erreur Commentaire:", error);
    }
}
        // AVANT : function ajouterCommentaire() {
// APRÈS :
async function ajouterCommentaire(postId, content) {
    
    // Maintenant 'await' est autorisé ici
    const { data: postData, error: postError } = await supabaseClient
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

    if (postData?.user_id && !postError) {
        sendNotification(postData.user_id, 'comment', postId, content);
    }
}

// 3. FONCTION FORMATNUMBER (Indispensable pour que le code ci-dessus fonctionne)
function formatNumber(num) {
    // Si la donnée est vide, null ou undefined, on affiche 0
    if (num === undefined || num === null) return '0';
    
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return num.toString();
}
// 5. Partager (Simulation)
function sharePost(postId) {
    // Récupérer l'URL actuelle
    const url = window.location.href.split('#')[0] + '?post=' + postId;
    
    if (navigator.share) {
        navigator.share({
            title: 'Regarde cette publication sur Printbam',
            url: url,
        }).catch(console.error);
    } else {
        // Fallback : copier dans le presse-papier
        navigator.clipboard.writeText(url);
        showToast("Lien copié !", "success");
    }
}

// Fonction utilitaire pour le temps relatif (ex: 2h)
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " an";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mois";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " j";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min";
    return "À l'instant";
}
       /* --- SYSTÈME D'ABONNEMENT (CORRIGÉ POUR ERREUR 409) --- */

/* --- SYSTÈME D'ABONNEMENT (VERSION FINALE) --- */

async function toggleFollow(targetUserId, btnElement) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return showToast("Connectez-vous", "error");
    if (user.id === targetUserId) return;

    // On vérifie l'état actuel grâce à la classe CSS 'following'
    const isFollowing = btnElement.classList.contains('following');

    try {
        if (isFollowing) {
            // --- ACTION : SE DÉSABONNER ---
            const { error } = await supabaseClient
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', targetUserId);
            
            if (!error) {
                updateFollowButton(btnElement, false); // Repasse en "S'abonner"
                showToast("Désabonné", "success");
            }

        } else {
            // --- ACTION : S'ABONNER ---
            const { error } = await supabaseClient
                .from('follows')
                .insert([{ follower_id: user.id, following_id: targetUserId }]);

            if (error) {
                // Si erreur "Déjà abonné", on synchronise l'affichage
                if (error.code === '23505' || error.status === 409) {
                    updateFollowButton(btnElement, true); // Force l'état "Abonné"
                } else {
                    throw error;
                }
            } else {
                updateFollowButton(btnElement, true); // Passe en "Abonné"
                showToast("Abonné !", "success");
            }
        }
        
        // Rafraîchir les chiffres du profil
        loadSocialProfile(); 

    } catch (err) {
        console.error("Erreur:", err);
        showToast("Erreur", "error");
    }
}

// Fonction de mise à jour visuelle
function updateFollowButton(btn, isFollowing) {
    if (isFollowing) {
        // ÉTAT : ABONNÉ (Gris)
        btn.innerText = "Abonné";
        // On ajoute la classe 'following' pour que le bouton sache qu'il est actif
        btn.classList.add('following');
        btn.className = "text-xs font-bold px-4 py-1.5 rounded-full transition-all ${isFollowing ? 'border border-slate-200 text-slate-500' : 'btn-sky-yellow shadow-sm'}";
    } else {
        // ÉTAT : S'ABONNER (Bleu)
        btn.innerText = "S'abonner";
        // On retire la classe
        btn.classList.remove('following');
        btn.className = "text-xs font-bold px-4 py-1.5 rounded-full btn-sky-yellow text-white hover:bg-blue-700 transition shadow";
    }
}

function resetProfileUI() {
    // On cible le conteneur blanc principal à l'intérieur de #profile-social-view
    const profileContainer = document.querySelector('#profile-social-view > div');
    
    if (profileContainer) {
        // On injecte le code HTML du Skeleton (L'animation CSS va faire le reste)
        profileContainer.innerHTML = getProfileSkeletonHTML();
    }
}

function getProfileSkeletonHTML() {
    return `
    <!-- CONTENEUR PRINCIPAL BLANC -->
    <div class="bg-white min-h-screen max-w-lg mx-auto shadow-sm relative z-20 pb-20">
        
        <!-- HEADER -->
        <div class="p-5 flex items-start gap-5 border-b border-gray-100">
            
            <!-- 1. AVATAR (Doit avoir l'ID 'social-avatar') -->
            <div class="relative">
                <div class="w-20 h-20 md:w-24 md:h-24 rounded-full border border-gray-200 p-1 bg-white">
                    <!-- On met l'ID sur l'image, le placeholder sera caché après -->
                    <img id="social-avatar" src="" alt="Profile" class="w-full h-full object-cover rounded-full hidden">
                    
                    <!-- Le placeholder affiché par défaut -->
                    <div id="social-avatar-placeholder" class="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-300">
                        <!-- On met une fausse image animée dedans pour le loader -->
                        <div class="w-full h-full bg-gray-200 skeleton skeleton-avatar"></div>
                    </div>
                </div>
            </div>

            <!-- 2. INFOS PRINCIPALES (Doit avoir l'ID 'social-fullname') -->
            <div class="flex-1 pt-1">
                <div class="flex items-center gap-1 mb-1">
                    <!-- IMPORTANT : id="social-fullname" -->
                    <!-- On met le texte gris animé dans la balise H1 pour qu'il soit remplacé par le vrai nom -->
                    <h1 id="social-fullname" class="text-xl font-bold text-black leading-none opacity-50">
                        <div class="skeleton skeleton-text short" style="height: 20px; width: 140px; display: block;"></div>
                    </h1>
                    
                    <span id="social-badge-inline" class="hidden ml-1">
                        <!-- Contenu vide, il sera caché de toute façon -->
                    </span>
                </div>
                
                <!-- Stats (Doivent avoir les IDs 'stat-following' et 'stat-followers') -->
                <div class="text-sm text-gray-600 font-medium mb-2">
                    <span id="stat-following">
                         <div class="skeleton skeleton-text medium" style="display:inline-block; width: 20px;"></div>
                    </span> suivis • 
                    <span id="stat-followers">
                         <div class="skeleton skeleton-text medium" style="display:inline-block; width: 20px;"></div>
                    </span> abonnés
                </div>
                
                <!-- Bouton Modifier -->
                <button class="px-3 py-1 bg-gray-100 text-xs font-bold text-gray-700 rounded hover:bg-gray-200 transition skeleton-btn"></button>
                
                <!-- Conteneur Follow -->
                <div id="profile-follow-container" class="hidden"></div>
            </div>
        </div>

        <!-- SECTION INFOS (Doivent avoir les IDs 'social-phone', 'social-username', 'social-dob') -->
        <div class="bg-gray-50 px-5 py-4 space-y-3 border-b border-gray-200">
            <!-- Téléphone -->
            <div class="flex items-center gap-3">
                <div class="skeleton skeleton-avatar" style="width: 16px; height: 16px;"></div>
                <span id="social-phone" class="text-sm text-gray-700 font-medium">
                     <div class="skeleton skeleton-text long"></div>
                </span>
            </div>
            <!-- Username -->
            <div class="flex items-center gap-3">
                <div class="skeleton skeleton-avatar" style="width: 16px; height: 16px;"></div>
                <span id="social-username" class="text-sm text-gray-700 font-medium">
                     <div class="skeleton skeleton-text medium"></div>
                </span>
            </div>
            <!-- Date de naissance -->
            <div class="flex items-center gap-3">
                <div class="skeleton skeleton-avatar" style="width: 16px; height: 16px;"></div>
                <span id="social-dob" class="text-sm text-gray-700 font-medium">
                     <div class="skeleton skeleton-text short"></div>
                </span>
            </div>
        </div>

        <!-- ONGLETS -->
        <div class="flex border-b border-gray-200">
            <button onclick="switchSocialTab('publications')" class="social-tab-btn flex-1 py-4 text-sm font-bold text-black border-b-2 border-black transition-colors">
                Publications
            </button>
            <button onclick="switchSocialTab('archives')" class="social-tab-btn flex-1 py-4 text-sm font-bold text-gray-400 border-b-2 border-transparent hover:text-gray-600 transition-colors">
                Publications archivées
            </button>
        </div>

        <!-- GRILLE DES PHOTOS (Doit avoir l'ID 'social-posts-grid') -->
        <div id="social-posts-grid" class="grid grid-cols-3 gap-1 bg-gray-100">
             <!-- 6 Blocs animés -->
             ${Array(6).fill(0).map(() => `
                <div class="aspect-square bg-gray-200 skeleton"></div>
             `).join('')}
        </div>

        <!-- BOUTON AJOUTER FLOTTANT -->
        <button class="fixed bottom-6 right-6 md:absolute md:bottom-6 md:right-6 w-14 h-14 btn-sky-yellow text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-50 skeleton" style="border-radius: 50%; width: 56px; height: 56px;">
            <div style="width: 20px; height: 20px; background: rgba(255,255,255,0.4); border-radius: 50%;"></div>
        </button>

    </div>
    `;
}
        
        /* --- NAVIGATION VERS UN AUTRE PROFIL --- */
// Fonction globale pour voir un profil
function viewUserProfile(userId) {
    // 1. On change de vue vers "profile-social"
    switchPage('profile-social');
    
    // 2. On force l'affichage de la vue (sécurité)
    const view = document.getElementById('profile-social-view');
    if (view) {
        view.style.display = 'block';
        setTimeout(() => view.classList.add('active'), 10);
    }

    // 3. On charge les données de CET utilisateur spécifique
    // On passe l'ID en paramètre
    loadSocialProfile(userId);
}
        /* --- SYSTÈME DE MESSAGERIE --- */
let lastMessageCount = 0; // Pour éviter le clignotement au rechargement

// 1. Démarrer une conversation
/* --- DÉMARRER OU CRÉER UNE DISCUSSION (VERSION OPTIMISÉE) --- */
async function startChat(targetUserId) {
    if (!targetUserId) return;

    // 1. ACTION IMMÉDIATE (Optimiste)
    // On change de page tout de suite pour ne pas avoir l'impression que ça bug
    switchPage('chat');

    // On affiche un loader dans la zone de message pendant le chargement
    const container = document.getElementById('chat-messages-container');
    if (container) {
        container.innerHTML = `<div class="flex justify-center items-center h-full">
            <div class="text-center text-slate-400">
                <i class="fas fa-spinner fa-spin text-2xl text-indigo-500 mb-2"></i>
                <p class="text-xs">Chargement...</p>
            </div>
        </div>`;
    }

    // 2. Vérification utilisateur (en arrière-plan)
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showToast("Veuillez vous connecter", "error");
        switchPage('messages'); // Retour si erreur
        return;
    }
    if (user.id === targetUserId) return;

    try {
        // 3. Recherche ou création du chat
        const { data: existingChat } = await supabaseClient
            .from('chats')
            .select('id')
            .or(`and(user_1_id.eq.${user.id},user_2_id.eq.${targetUserId}),and(user_1_id.eq.${targetUserId},user_2_id.eq.${user.id})`)
            .maybeSingle();

        let chatId;

        if (existingChat) {
            chatId = existingChat.id;
        } else {
            // Création si inexistant
            const { data: newChat, error } = await supabaseClient
                .from('chats')
                .insert([{ user_1_id: user.id, user_2_id: targetUserId }])
                .select('id')
                .single();
            
            if (error) throw error;
            chatId = newChat.id;

            // Mise à jour du cache global
            if (typeof myChatIdsCache !== 'undefined') {
                myChatIdsCache.add(chatId);
            }
        }

        // 4. Ouuration finale de la salle (charge les vrais messages)
        openChatRoom(chatId, targetUserId);

    } catch (err) {
        console.error("Erreur startChat:", err);
        showToast("Erreur de chargement", "error");
        // Retour à la liste en cas d'erreur grave
        switchPage('messages'); 
    }
}

/* --- CHARGEMENT LISTE CHAT (AVEC STATUT & LECTURE) --- */
async function loadChatList() {
    const container = document.getElementById('chat-list-container');
    if (!container) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    try {
        // 1. Récupérer les discussions
        const { data: chats, error } = await supabaseClient
            .from('chats')
            .select('*')
            .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        if (!chats || chats.length === 0) {
            container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center"><i class="fas fa-comments text-4xl mb-3 opacity-20"></i><p>Aucune discussion.</p></div>`;
            return;
        }

        const otherUserIds = chats.map(c => c.user_1_id === user.id ? c.user_2_id : c.user_1_id);
        const chatIds = chats.map(c => c.id);

        // 2. Requêtes Parallèles (Ajout de last_seen pour le statut)
        const [profilesRes, messagesRes, unreadRes] = await Promise.all([
            supabaseClient.from('profiles')
                .select('id, full_name, avatar_url, is_certified, last_seen') // <-- Ajout last_seen
                .in('id', otherUserIds),
            
            supabaseClient.from('messages')
                .select('chat_id, content, sender_id, created_at, is_read') // <-- Ajout is_read
                .in('chat_id', chatIds)
                .order('created_at', { ascending: false })
                .limit(50),
            
            supabaseClient.from('messages')
                .select('chat_id')
                .eq('is_read', false)
                .neq('sender_id', user.id)
                .in('chat_id', chatIds)
        ]);

        const profilesMap = new Map(profilesRes.data?.map(p => [p.id, p]));
        
        const latestMessagesMap = new Map();
        messagesRes.data?.forEach(msg => {
            if (!latestMessagesMap.has(msg.chat_id)) {
                latestMessagesMap.set(msg.chat_id, msg);
            }
        });

        const unreadCountsMap = new Map();
        unreadRes.data?.forEach(msg => {
            unreadCountsMap.set(msg.chat_id, (unreadCountsMap.get(msg.chat_id) || 0) + 1);
        });

        // 3. Rendu
        const fragment = document.createDocumentFragment();

        chats.forEach(chat => {
            const otherId = chat.user_1_id === user.id ? chat.user_2_id : chat.user_1_id;
            const profile = profilesMap.get(otherId) || { full_name: 'Utilisateur' };
            const lastMsg = latestMessagesMap.get(chat.id);
            const unreadCount = unreadCountsMap.get(chat.id) || 0;
            
            let previewText = "Aucun message";
            let timeText = "";
            let textClass = "text-slate-500 truncate"; 
            let badgeHtml = "";
            
            // --- NOUVEAU : LOGIQUE STATUT EN LIGNE ---
            let onlineDot = "";
            if (profile.last_seen) {
                const lastSeenDate = new Date(profile.last_seen);
                const now = new Date();
                const diffSeconds = (now - lastSeenDate) / 1000;
                
                // Si en ligne il y a moins de 2 min
                if (diffSeconds < 120) {
                    onlineDot = `<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>`;
                }
            }

            if (lastMsg) {
                previewText = lastMsg.content;
                timeText = getTimeAgoSimple(new Date(lastMsg.created_at));
                
                // --- NOUVEAU : LOGIQUE CHECKS (Lecture) ---
                if (lastMsg.sender_id === user.id) {
                    // C'est MON message
                    if (lastMsg.is_read) {
                        // Lu : 2 checks bleus
                        previewText += ` <i class="fas fa-check-double text-blue-500 ml-1 text-[10px]"></i>`;
                    } else {
                        // Envoyé : 1 check gris
                        previewText += ` <i class="fas fa-check text-slate-400 ml-1 text-[10px]"></i>`;
                    }
                }
            }

            // Logique Badge Non-Lu (Reçus)
            if (unreadCount > 0) {
                textClass = "text-gradient-unread truncate"; 
                const plural = unreadCount > 1 ? 's' : '';
                badgeHtml = `<span class="badge-unread-count">${unreadCount} nouveau${plural} message${plural}</span>`;
            }

            const div = document.createElement('div');
            div.className = 'flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-700 transition';
            div.onclick = () => startChat(otherId);
            
            div.innerHTML = `
                <div class="relative flex-shrink-0">
                    <img src="${profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}`}" class="w-12 h-12 rounded-full object-cover bg-slate-200 shadow-sm">
                    ${onlineDot}
                    ${profile.is_certified ? '<i class="fas fa-check-circle text-blue-500 text-[10px] absolute top-0 right-0 bg-white rounded-full"></i>' : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-baseline mb-0.5">
                         <h4 class="font-semibold text-slate-900 dark:text-white truncate">${profile.full_name}</h4>
                         <span class="text-[10px] text-slate-400 flex-shrink-0 ml-2">${timeText}</span>
                    </div>
                    <div class="flex items-center gap-1">
                         <p class="text-sm ${textClass}">${previewText}</p>
                    </div>
                    <div class="mt-1">${badgeHtml}</div>
                </div>
            `;
            fragment.appendChild(div);
        });
        
        container.innerHTML = ''; 
        container.appendChild(fragment); 

    } catch (err) {
        console.error("Erreur loadChatList:", err);
    }
}

/* --- OUVERTURE D'UNE DISCUSSION (VERSION CORRIGÉE) --- */
async function openChatRoom(chatId, targetUserId) {
    currentChatId = chatId;
    currentTargetUserId = targetUserId;

    // 1. Récupérer l'utilisateur UNE SEULE FOIS
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    switchPage('chat');

    // 2. Charger le Header
    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('full_name, avatar_url, is_certified')
        .eq('id', targetUserId)
        .maybeSingle();

    if (profile) {
        const nameEl = document.getElementById('chat-header-name');
        const badge = profile.is_certified ? '<i class="fas fa-check-circle text-blue-500 text-xs ml-1"></i>' : '';
        nameEl.innerHTML = `${profile.full_name} ${badge}`;

        const avatarEl = document.getElementById('chat-header-avatar');
        const defaultAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.full_name)}`;
        avatarEl.src = profile.avatar_url || defaultAvatar;
    }

    // 3. Charger l'historique
    await loadChatMessages(chatId);
    
    // 4. Marquer comme LU immédiatement
    markChatAsRead(chatId);

    // 5. Nettoyer l'ancien channel
    if (window.currentChatChannel) {
        await supabaseClient.removeChannel(window.currentChatChannel);
    }

    // 6. CONNEXION WEBSOCKET (INSERT + UPDATE)
    window.currentChatChannel = supabaseClient
        .channel(`realtime:chat:${chatId}`)
        
        // ÉCOUTEUR A : Nouveaux Messages
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
        }, (payload) => {
            handleRealtimeMessage(payload.new);
        })
        
        // ÉCOUTEUR B : CONFIRMATION DE LECTURE (UPDATE)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
        }, (payload) => {
            const msg = payload.new;
            
            // Condition : Le message est lu (is_read=true) ET c'est MOI l'expéditeur
            if (msg.is_read === true && msg.sender_id === user.id) {
                updateMessageReadStatusUI(msg.id, true);
            }
        })
        .subscribe();

    // 7. Statut "En ligne"
    if (chatStatusInterval) clearInterval(chatStatusInterval);
    refreshChatStatus(targetUserId);
    chatStatusInterval = setInterval(() => {
        if (currentTargetUserId === targetUserId) {
            refreshChatStatus(targetUserId);
        } else {
            clearInterval(chatStatusInterval);
        }
    }, 30000);
}

            /* --- MISE À JOUR VISUELLE DE L'ÉTAT "LU" --- */
function updateMessageReadStatusUI(msgId, isRead) {
    // On cherche l'élément du message par son ID réel
    const msgElement = document.querySelector(`[data-msg-id="${msgId}"]`);
    if (!msgElement) return;

    // On cherche l'icône de statut
    const icon = msgElement.querySelector('.fa-check'); // Cible la coche simple
    
    if (icon && isRead) {
        // TRANSFORMATION : 1 coche grise -> 2 coches bleues
        icon.classList.remove('fa-check');        // Retire "1 coche"
        icon.classList.add('fa-check-double');    // Ajoute "2 coches"
        
        icon.classList.remove('text-white/60');   // Retire gris
        icon.classList.add('text-blue-300');      // Met en bleu
    }
}
            
            /* --- SERVICE GLOBAL D'ÉCOUTE (TEMPS RÉEL) --- */
async function initGlobalRealtimeListeners() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    console.log("🚀 Initialisation du service global Realtime...");

    // 1. Préparer le cache des chats existants
    const { data: chats } = await supabaseClient
        .from('chats')
        .select('id')
        .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`);
    
    if (chats) {
        chats.forEach(c => myChatIdsCache.add(c.id));
    }

    // 2. NETTOYER LES ANCIENS CHANNELS (Évite les doublons)
    if (globalMessageListener) await supabaseClient.removeChannel(globalMessageListener);
    if (globalNotifListener) await supabaseClient.removeChannel(globalNotifListener);

    // 3. ÉCOUTEUR A : NOUVEAUX MESSAGES
    globalMessageListener = supabaseClient
        .channel('global-messages-channel')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
        }, async (payload) => {
            const msg = payload.new;

            // A. Si c'est MOI qui envoie le message, on ne notifie pas
            if (msg.sender_id === user.id) return;

            // B. Vérifier si ce chat nous appartient (ou si c'est un nouveau chat)
            // Si le chat n'est pas dans le cache, on vérifie en BD (cas d'un nouveau chat créé par l'autre)
            if (!myChatIdsCache.has(msg.chat_id)) {
                 const { data: chatCheck } = await supabaseClient
                    .from('chats')
                    .select('id')
                    .eq('id', msg.chat_id)
                    .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
                    .maybeSingle();
                 
                 if (!chatCheck) return; // Ce n'est pas mon chat
                 
                 // C'est un nouveau chat pour moi, on l'ajoute au cache
                 myChatIdsCache.add(msg.chat_id);
                 console.log("Nouveau chat détecté et ajouté au cache :", msg.chat_id);
            }

            // --- LOGIQUE D'AFFICHAGE ---
            
            // 1. Si on est DÉJÀ dans ce chat spécifique -> On ne fait rien (géré par le listener local)
            if (window.currentChatId === msg.chat_id) {
                return; 
            }

            // 2. Récupérer les infos de l'expéditeur
            const { data: senderProfile } = await supabaseClient
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', msg.sender_id)
                .single();

            // 3. Afficher le Toast Facebook Style
            if (senderProfile) {
                showIncomingMessageToast(
                    senderProfile.full_name,
                    msg.content.substring(0, 30) + '...',
                    senderProfile.avatar_url,
                    msg.chat_id,
                    msg.sender_id
                );
            }

            // 4. Mettre à jour le badge rouge du Dock
            updateMessageBadge();

            // 5. MISE À JOUR AUTOMATIQUE DE LA LISTE (NOUVEAU)
            // Si l'utilisateur est sur la page "Messages", on rafraîchit la liste
            const messagesView = document.getElementById('messages-view');
            if (messagesView && messagesView.classList.contains('active')) {
                console.log("Mise à jour de la liste des discussions...");
                loadChatList(); // Recharge la liste pour montrer le nouveau message / déplacer le chat
            }

        })
        .subscribe();

    // 4. ÉCOUTEUR B : NOUVELLES NOTIFICATIONS
    globalNotifListener = supabaseClient
        .channel('global-notifs-channel')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`
        }, (payload) => {
            const notif = payload.new;
            
            // Mettre à jour le badge
            updateNotificationBadge();
            // Afficher un Toast simple
            showToast(`🔔 Nouvelle notification !`, "success");
        })
        .subscribe();
}
            
// --- FONCTION HELPER POUR L'INJECTION DIRECTE ---
async function handleRealtimeMessage(newMessage) {
    const container = document.getElementById('chat-messages-container');
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user || !container) return;

    const isMe = newMessage.sender_id === user.id;

    // --- CAS 1 : C'est MON message (Confirmation du serveur) ---
    if (isMe) {
        // On cherche le message temporaire par son attribut 'data-temp-id'
        const pendingEl = container.querySelector('[data-temp-id]');

        if (pendingEl) {
            // 1. On remplace l'ID temporaire par le VRAI ID (CRUCIAL pour la lecture)
            pendingEl.setAttribute('data-msg-id', newMessage.id);
            
            // 2. On nettoie les attributs et classes temporaires
            pendingEl.removeAttribute('data-temp-id');
            pendingEl.classList.remove('opacity-60', 'animate-pulse'); // Styles d'envoi en cours
            
            // 3. Mise à jour de l'icône de statut
            const statusIcon = pendingEl.querySelector('.status-icon');
            if (statusIcon) {
                // On remplace l'horloge par 1 coche (Envoyé) ou 2 coches (Lu) selon l'état
                if (newMessage.is_read) {
                     statusIcon.className = 'fas fa-check-double text-[10px] ml-1 text-blue-300 status-icon';
                } else {
                     // Par défaut à la confirmation : 1 coche grise/blanche
                     statusIcon.className = 'fas fa-check text-[10px] ml-1 text-white/60 status-icon';
                }
            }
        }
        return; 
    }

    // --- CAS 2 : C'est un message de L'AUTRE (Nouveau message) ---
    
    // On utilise createMessageBubble pour garder le style et le menu contextuel
    const row = createMessageBubble(newMessage, false, user.id);

    container.appendChild(row);
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    
    // Petite vibration si l'app est en arrière-plan
    if (document.hidden && navigator.vibrate) navigator.vibrate(200);
    
    // Mise à jour du badge global
    updateMessageBadge();
}

/* ==========================================================
   SECTION 1 : CHAT MESSAGING (ULTRA OPTIMISÉ)
   ========================================================== */

// 1. Charger l'historique (Version Performance avec DocumentFragment)
async function loadChatMessages(chatId) {
    const container = document.getElementById('chat-messages-container');
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user || !container) return;

    // Sauvegarder la position de scroll pour ne pas perturber la lecture
    const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 50;
    
    try {
        const { data: messages, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Utilisation d'un Fragment pour performances optimales (1 seul repaint DOM)
        const fragment = document.createDocumentFragment();
        let lastDate = null;

        if (!messages || messages.length === 0) {
            container.innerHTML = '<div class="text-center py-10 text-slate-400 text-xs">Commencez la conversation !</div>';
            return;
        }

        container.innerHTML = ''; // Vider une seule fois

        messages.forEach(msg => {
            const msgDate = new Date(msg.created_at).toLocaleDateString('fr-FR');

            // Séparateur de date
            if (lastDate !== msgDate) {
                const dateEl = document.createElement('div');
                dateEl.className = 'text-center my-4';
                dateEl.innerHTML = `<span class="text-[10px] font-bold text-slate-400 uppercase bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">${msgDate}</span>`;
                fragment.appendChild(dateEl);
                lastDate = msgDate;
            }

            // Bulle de message
            const isMe = msg.sender_id === user.id;
            const row = createMessageBubble(msg, isMe);
            fragment.appendChild(row);
        });

        container.appendChild(fragment);

        // Auto-scroll uniquement si on était déjà en bas
        if (isScrolledToBottom) {
            container.scrollTop = container.scrollHeight;
        }

    } catch (err) {
        console.error("Erreur loadMessages:", err);
    }
}

// Helper pour créer une bulle de message (À placer en dehors des autres fonctions)
function createMessageBubble(msg, isMe) {
    const row = document.createElement('div');
    row.className = `flex w-full mb-3 px-4 ${isMe ? 'justify-end' : 'justify-start'}`;
    row.setAttribute('data-msg-id', msg.id);

    // Styles adaptatifs
    const bubbleClass = isMe 
        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl rounded-br-sm shadow-md' 
        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700';

    const time = new Date(msg.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
    
    // Icônes de statut
    let statusIconHtml = '';
    if (isMe) {
        if (msg.is_read) {
            statusIconHtml = '<i class="fas fa-check-double text-[10px] ml-1 text-blue-300"></i>';
        } else {
            statusIconHtml = '<i class="fas fa-check text-[10px] ml-1 text-white/60"></i>';
        }
    }

    row.innerHTML = `
        <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]">
            <div class="${bubbleClass} px-4 py-2 text-sm leading-relaxed break-words">
                ${msg.content}
            </div>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 mx-1 flex items-center">
                ${time} ${statusIconHtml}
            </span>
        </div>
    `;
    
    // Ajout des écouteurs pour le menu contextuel (Voir point 3)
    addContextMenuListeners(row, msg);
    
    return row;
}

// 2. Envoyer un message (UI Optimiste)
async function sendChatMessage(e) {
    if(e) e.preventDefault();
    
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    
    // Sécurité : pas de contenu ou pas de chat ouvert
    if (!content || !currentChatId) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    // --- 1. GESTION DU MODE ÉDITION ---
    // Si on est en train de modifier un message existant
    if (window.isEditingId) {
        const { error } = await supabaseClient
            .from('messages')
            .update({ content: content })
            .eq('id', window.isEditingId);

        if (!error) {
            // Mise à jour visuelle immédiate dans le chat
            const msgEl = document.querySelector(`[data-msg-id="${window.isEditingId}"] .break-words`);
            if (msgEl) {
                msgEl.innerText = content;
                // Ajouter indicateur "modifié" si nécessaire
            }
            showToast("Message modifié", "success");
        } else {
            showToast("Erreur modification", "error");
        }
        
        // Reset du mode édition et champ
        window.isEditingId = null;
        input.value = '';
        toggleChatSendButton(); // Remet l'icône micro
        return;
    }

    // --- 2. GESTION DU MODE RÉPONSE ---
    const replyContainer = document.getElementById('reply-container');
    const isReplying = replyContainer && !replyContainer.classList.contains('hidden');
    
    // Réinitialisation immédiate de l'UI (Input + Bouton + Réponse)
    input.value = ''; 
    toggleChatSendButton(); // Remet l'icône micro
    if (isReplying) cancelReply(); // Cache la barre de réponse

    // --- 3. AFFICHAGE OPTIMISTE (Message temporaire) ---
    const tempId = 'temp-' + Date.now();
    const tempMsg = {
        id: tempId,
        sender_id: user.id, // Nécessaire pour createMessageBubble
        content: content,
        created_at: new Date().toISOString(),
        is_read: false
    };

    const container = document.getElementById('chat-messages-container');
    
    // Appel correct de createMessageBubble avec les 3 arguments
    const row = createMessageBubble(tempMsg, true, user.id); 
    
    // Style "En cours d'envoi"
    row.classList.add('opacity-60', 'animate-pulse'); 
    row.setAttribute('data-temp-id', tempId); // Marqueur pour le retrouver via le Realtime
    
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;

    // --- 4. ENVOI RÉEL SUPABASE ---
    const { error } = await supabaseClient
        .from('messages')
        .insert([{
            chat_id: currentChatId,
            sender_id: user.id,
            content: content,
            // Si vous avez une colonne 'reply_to' dans votre table :
            // reply_to: isReplying ? selectedMessageForContext?.id : null 
        }]);

    if (error) {
        console.error("Erreur envoi:", error);
        showToast("Erreur d'envoi", "error");
        
        // En cas d'erreur, on arrête l'animation et on marque le message
        row.classList.remove('opacity-60', 'animate-pulse');
        row.classList.add('bg-red-100', 'dark:bg-red-900/30'); // Couleur erreur
        row.querySelector('.break-words').innerHTML += '<br><span class="text-red-500 text-xs">Échec de l\'envoi</span>';
    }
    
    // Si succès, le Listener Realtime (INSERT) détectera le nouveau message,
    // remplacera l'ID temporaire par le vrai ID et enlèvera l'opacité.
}

/* ==========================================================
   SECTION 2 : NOTIFICATIONS (TEMPS RÉEL & BADGES)
   ========================================================== */

// 1. Initialisation du Listener Temps Réel (À appeler au démarrage de l'app)
function initRealtimeNotifications() {
    supabaseClient
        .channel('realtime:notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
            const notif = payload.new;
            // Vérifier si c'est pour moi
            if (notif.recipient_id === supabaseClient.auth.user()?.id) {
                updateNotificationBadge(); // MAJ badge
                showToast("🔔 Nouvelle notification !", "success");
            }
        })
        .subscribe();
}

// 2. Charger les notifications (Render Optimisé)
async function loadNotifications() {
    const container = document.getElementById('notifications-list-container');
    if (!container) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    // Loader simple
    container.innerHTML = `<div class="text-center py-10 text-slate-400"><i class="fas fa-spinner fa-spin"></i></div>`;

    try {
        const { data: notifs, error } = await supabaseClient
            .from('notifications')
            .select(`*, profiles ( full_name, avatar_url )`)
            .eq('recipient_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50); // Limite pour perf

        if (error) throw error;

        if (!notifs || notifs.length === 0) {
            container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-400"><i class="far fa-bell-slash text-4xl mb-3 opacity-20"></i><p>Aucune notification.</p></div>`;
            return;
        }

        container.innerHTML = notifs.map(notif => {
            const actor = notif.profiles || {};
            const avatar = actor.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix';
            const name = actor.full_name || 'Utilisateur';
            
            // Logique d'icône et message
            const config = {
                'like': { icon: 'fa-heart', color: 'text-red-500', msg: 'a aimé votre publication.' },
                'comment': { icon: 'fa-comment', color: 'text-blue-500', msg: `a commenté : "${notif.content_preview || '...'}"` },
                'follow': { icon: 'fa-user-plus', color: 'text-green-500', msg: 'a commencé à vous suivre.' }
            };
            const { icon, color, msg } = config[notif.type] || { icon: 'fa-bell', color: 'text-slate-500', msg: 'Nouvelle interaction.' };

            const bgClass = notif.is_read ? 'bg-white dark:bg-slate-900' : 'bg-indigo-50 dark:bg-slate-800 border-l-4 border-indigo-500';

            return `
            <div class="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition ${bgClass}">
                <img src="${avatar}" class="w-12 h-12 rounded-full object-cover shadow-sm">
                <div class="flex-1">
                    <p class="text-sm text-slate-800 dark:text-slate-200">
                        <span class="font-bold">${name}</span> ${msg}
                    </p>
                    <span class="text-[10px] text-slate-400">${getTimeAgo(new Date(notif.created_at))}</span>
                </div>
                <i class="fas ${icon} ${color} opacity-50"></i>
            </div>`;
        }).join('');

    } catch (err) {
        console.error("Erreur notifs:", err);
    }
}

// 3. Badge de Notification (Lecture rapide HEAD)
async function updateNotificationBadge() {
    const badge = document.getElementById('notif-badge-count');
    if (!badge) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { count } = await supabaseClient
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

    if (count && count > 0) {
        badge.innerText = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

/* ==========================================================
   SECTION 3 : UTILITAIRES & CONTENU
   ========================================================== */

// Validation de contenu (Version améliorée avec liste)
function containsInappropriateContent(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    // Liste simple (à enrichir ou utiliser une API externe pour un vrai projet)
    const forbiddenWords = ['connard', 'merde', 'putain', 'idiot', 'bastard', 'asshole']; 
    return forbiddenWords.some(word => lowerText.includes(word));
}

/* --- RAFRAÎCHISSEMENT DU STATUT EN LIGNE --- */
/* --- LIRE LE STATUT DE L'AUTRE --- */
async function refreshChatStatus(userId) {
    const statusText = document.getElementById('chat-header-status-text');
    const statusDot = document.getElementById('chat-status-dot');
    
    if (!statusText || !userId) return;

    try {
        // On récupère ONLY last_seen pour la performance
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('last_seen')
            .eq('id', userId)
            .maybeSingle();

        if (error || !profile) {
             statusText.innerText = "Hors ligne";
             statusText.className = "text-[11px] text-slate-400";
             if(statusDot) statusDot.classList.add('hidden');
             return;
        }

        const lastSeen = profile.last_seen;
        
        // Si pas de date, on considère hors ligne
        if (!lastSeen) {
             statusText.innerText = "Hors ligne";
             if(statusDot) statusDot.classList.add('hidden');
             return;
        }

        const now = new Date();
        const lastDate = new Date(lastSeen);
        const diffSeconds = Math.floor((now - lastDate) / 1000);

        // LOGIQUE STRICTE : Si actif il y a moins de 2 min (120s)
        if (diffSeconds < 120) { 
            statusText.innerText = "En ligne";
            statusText.className = "text-[11px] text-emerald-400 font-semibold"; // Vert
            if(statusDot) {
                statusDot.classList.remove('hidden');
                statusDot.className = "absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse";
            }
        } else {
            statusText.innerText = getTimeAgoSimple(lastDate);
            statusText.className = "text-[11px] text-slate-400";
            if(statusDot) statusDot.classList.add('hidden');
        }

    } catch (err) {
        console.error("Erreur refreshChatStatus:", err);
    }
}

// Helper pour le temps (ex: "il y a 5 min")
function getTimeAgoSimple(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "À l'instant";
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
    return `le ${date.toLocaleDateString('fr-FR')}`;
}

// Recherche Toggle (UX Pro)
function toggleSearch() {
    const searchBar = document.getElementById('feed-search-bar');
    const searchInput = document.getElementById('feed-search-input');
    
    if (searchBar.classList.contains('hidden')) {
        searchBar.classList.remove('hidden');
        searchBar.style.opacity = '0';
        searchBar.style.transform = 'translateY(-10px)';
        // Animation d'apparition
        requestAnimationFrame(() => {
            searchBar.style.transition = 'all 0.3s ease';
            searchBar.style.opacity = '1';
            searchBar.style.transform = 'translateY(0)';
            searchInput.focus();
        });
    } else {
        searchBar.style.opacity = '0';
        searchBar.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            searchBar.classList.add('hidden');
            searchInput.value = ''; 
            searchFeed(''); // Reset feed
        }, 300);
    }
}

            /* --- METTRE À JOUR MA PRÉSENCE --- */
/* --- METTRE À JOUR MA PRÉSENCE (JE SUIS EN LIGNE) --- */
async function updateMyPresence() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    // On met à jour notre profil avec l'heure actuelle
    try {
        await supabaseClient
            .from('profiles')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', user.id);
    } catch (err) {
        console.warn("Impossible de mettre à jour la présence :", err.message);
    }
}

// Lancer cette mise à jour toutes les 30 secondes pour rester "En ligne"
setInterval(updateMyPresence, 30000); 
// Et l'appeler une fois au chargement
updateMyPresence(); 
            /* ==========================================================
   FONCTIONS MANQUANTES POUR LE CHAT (BADGE & LECTURE)
   ========================================================== */

// 1. Mettre à jour le badge rouge de message (Dock & Header)
async function updateMessageBadge() {
    const badge = document.getElementById('msg-badge-count');
    if (!badge) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    try {
        // A. Récupérer tous mes chats
        const { data: myChats } = await supabaseClient
            .from('chats')
            .select('id')
            .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`);

        if (!myChats || myChats.length === 0) {
            badge.classList.add('hidden');
            return;
        }

        const myChatIds = myChats.map(c => c.id);

        // B. Compter les messages NON LUS envoyés par les AUTRES
        const { count } = await supabaseClient
            .from('messages')
            .select('*', { count: 'exact', head: true }) // head: true pour perf (pas de body)
            .in('chat_id', myChatIds)
            .neq('sender_id', user.id) // Pas les miens
            .eq('is_read', false);     // Non lus

        const unreadCount = count || 0;

        // C. Affichage du badge
        if (unreadCount > 0) {
            badge.innerText = unreadCount > 99 ? '99+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

    } catch (err) {
        console.error("Erreur updateMessageBadge:", err);
    }
}

// 2. Marquer une conversation comme lue (quand on l'ouvre)
async function markChatAsRead(chatId) {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
        console.error("Utilisateur non authentifié");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('messages')
            .update({ is_read: true })
            .match({ 
                chat_id: chatId, 
                is_read: false 
            })
            .neq('sender_id', user.id);

        if (error) throw error;

        // Mise à jour de l'UI locale
        if (typeof updateMessageBadge === 'function') {
            await updateMessageBadge();
        }
        
    } catch (err) {
        console.error("Erreur markChatAsRead:", err.message);
    }
}

            /* --- FONCTION TOAST POUR MESSAGE ENTRANT (STYLE FACEBOOK) --- */
function showIncomingMessageToast(senderName, messagePreview, avatarUrl, chatId, senderId) {
    const container = document.getElementById('toast-container');
    
    // Création du toast spécial
    const toast = document.createElement('div');
    toast.className = 'toast incoming-message cursor-pointer hover:scale-[1.02] transition-transform';
    toast.style.background = 'white';
    toast.style.borderLeft = '4px solid #3b82f6'; // Bleu pour message
    toast.style.minWidth = '280px';
    
    // Date formatée
    const time = new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});

    // HTML interne du Toast
    toast.innerHTML = `
        <div class="flex items-center gap-3 p-2" onclick="handleToastClick('${chatId}', '${senderId}')">
            <div class="relative">
                <img src="${avatarUrl}" class="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm">
                <div class="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                    <i class="fas fa-comment text-[8px]"></i>
                </div>
            </div>
            <div class="flex-1 overflow-hidden">
                <p class="text-sm font-bold text-slate-900 truncate">${senderName}</p>
                <p class="text-xs text-slate-500 truncate">${messagePreview}</p>
                <span class="text-[10px] text-slate-400">${time}</span>
            </div>
        </div>
    `;

    container.appendChild(toast);

    // Auto-suppression après 5 secondes
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Fonction utilitaire pour gérer le clic sur le Toast
async function handleToastClick(chatId, senderId) {
    // 1. Fermer le toast cliqué
    event.currentTarget.closest('.toast').remove();
    
    // 2. Ouvrir la discussion
    // Si la fonction startChat existe (pour créer/récupérer le chat)
    if (typeof startChat === 'function') {
        await startChat(senderId);
    } else {
        // Sinon ouvrir directement la room si on a déjà l'ID
        openChatRoom(chatId, senderId);
    }
}
            
// Initialisation à ajouter dans votre DOMContentLoaded
// initRealtimeNotifications(); // Lancer le realtime au démarrage

// 2. Fonction pour filtrer les posts en temps réel (Recherche Facebook-like)
document.getElementById('feed-search-input')?.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    searchFeed(query);
});

// REMPLACEZ L'ANCIENNE FONCTION PAR CECI
async function searchFeed(query) {
    const container = document.getElementById('global-feed-container');
    
    // 1. Gestion du Debounce (Anti-spam)
    // On annule la recherche précédente si l'utilisateur tape vite
    clearTimeout(searchDebounceTimer);
    
    searchDebounceTimer = setTimeout(async () => {
        // 2. Si le champ est vide, on recharge le feed normal
        if (!query || query.trim() === '') {
            return loadGlobalFeed('recent', 'all', false);
        }

        // 3. Affichage du Loader
        container.innerHTML = `
            <div class="col-span-full flex justify-center py-20">
                <div class="flex items-center gap-2 text-slate-400 text-sm font-bold">
                    <i class="fas fa-circle-notch fa-spin text-indigo-500"></i>
                    Recherche en cours...
                </div>
            </div>`;

        try {
            // 4. Requête Supabase (Recherche dans le CAPTION)
            // Le symbole % est un joker SQL : %mot% signifie "contient mot"
            const { data: posts, error } = await supabaseClient
                .from('posts')
                .select(`
                    *,
                    profiles ( id, full_name, username, avatar_url, is_certified ),
                    post_likes(count),
                    post_comments(count)
                `)
                .ilike('caption', `%${query}%`) // Recherche insensible à la casse
                .order('created_at', { ascending: false })
                .limit(30);

            if (error) throw error;

            // 5. Gestion "Aucun résultat"
            if (!posts || posts.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-20 text-slate-400">
                        <i class="fas fa-search text-4xl mb-3 opacity-20"></i>
                        <p class="font-bold">Aucun résultat pour "<span class="text-indigo-600">${query}</span>"</p>
                        <p class="text-xs mt-1">Essayez avec d'autres mots-clés.</p>
                    </div>`;
                return;
            }

            // 6. Rendu des résultats (Pro)
            const { data: { user } } = await supabaseClient.auth.getUser();
            const myId = user?.id;

            container.innerHTML = posts.map(post => {
                const profile = post.profiles || {};
                const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'user'}`;
                const userName = profile.full_name || 'Utilisateur';
                const timeAgo = typeof getTimeAgo === 'function' ? getTimeAgo(new Date(post.created_at)) : '';
                const likeCount = post.post_likes?.[0]?.count || 0;
                const commentCount = post.post_comments?.[0]?.count || 0;
                
                // Sécurité pour l'affichage du texte
                const safeCaption = post.caption ? post.caption.replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';

                return `
                <article class="bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-lg overflow-hidden mb-2 transition-all hover:shadow-xl">
                    <!-- HEADER -->
                    <div class="p-4 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <img src="${avatarUrl}" class="w-11 h-11 rounded-full border-2 border-indigo-50 shadow-sm">
                            <div>
                                <div class="flex items-center gap-1 font-bold text-sm text-slate-900 dark:text-white">
                                    ${userName} ${profile.is_certified ? '<i class="fas fa-check-circle text-blue-500 text-[10px]"></i>' : ''}
                                </div>
                                <div class="text-[11px] text-slate-400 font-medium">${timeAgo}</div>
                            </div>
                        </div>
                    </div>

                    <!-- CAPTION -->
                    <div class="px-4 pb-2">
                        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            ${safeCaption}
                        </p>
                    </div>

                    <!-- MEDIA -->
                    ${post.image_url ? `<img src="${post.image_url}" class="w-full h-auto object-cover" loading="lazy">` : ''}

                    <!-- ACTIONS SIMPLIFIEES (Pour un resultat de recherche, on peut simplifier) -->
                    <div class="px-4 py-2 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                        <div class="flex items-center gap-4 text-slate-500 text-xs font-bold">
                            <span><i class="far fa-heart text-red-500 mr-1"></i> ${likeCount}</span>
                            <span><i class="far fa-comment text-blue-500 mr-1"></i> ${commentCount}</span>
                        </div>
                        <button onclick="openPostModal('${post.id}')" class="text-xs font-bold text-indigo-600 hover:underline">Voir détails</button>
                    </div>
                </article>
                `;
            }).join('');

        } catch (err) {
            console.error("Erreur recherche:", err);
            container.innerHTML = `<div class="col-span-full text-center py-10 text-red-500"><p>Erreur lors de la recherche.</p></div>`;
        }

    }, 400); // Délai de 400ms avant de lancer la recherche
}
        async function reportPost(postId) {
    const reason = prompt("Pourquoi signalez-vous cette publication ? (Haine, Arnaque, Pornographie, Autre)");
    if (!reason) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return showToast("Connectez-vous pour signaler.", "error");

    // Envoi dans une table 'reports' (à créer dans Supabase)
    await supabaseClient.from('reports').insert([{
        reporter_id: user.id,
        post_id: postId,
        reason: reason,
        status: 'pending' // En attente de modération
    }]);

    showToast("Signalement envoyé aux modérateurs.", "success");
}

let openReactionsPopupId = null;

function toggleReactionPopup(postId, btnElement) {
    // Si on clique sur un bouton du menu (dans le cas d'une sélection directe via le menu)
    if (btnElement && btnElement.dataset.type) {
        setReaction(postId, btnElement.dataset.type);
        closeReactionPopup(postId);
        return;
    }

    // Logique d'ouverture/fermeture standard...
    const popup = document.getElementById(`reactions-popup-${postId}`);
    
    if (popup.style.display === 'flex') {
        closeReactionPopup(postId);
    } else {
        document.querySelectorAll('.reactions-popup').forEach(el => el.style.display = 'none');
        
        // Génération HTML (Boutons Facebook Style)
        popup.innerHTML = REACTIONS.map(r => `
            <div class="reaction-btn" data-type="${r.type}" onclick="setReaction('${postId}', '${r.type}', this)">
                <i class="fas ${r.icon}"></i>
            </div>
        `).join('');
        
        popup.style.display = 'flex';
        openReactionsPopupId = postId;
    }
}

function closeReactionPopup(postId) {
    const popup = document.getElementById(`reactions-popup-${postId}`);
    if (popup) popup.style.display = 'none';
    openReactionsPopupId = null;
}

// Fonction de mise à jour du style (Remplacez l'ancienne setReaction)
async function setReaction(postId, reactionType, btnElement) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        showToast("Connectez-vous pour réagir", "warning");
        return;
    }

    try {
        // 1. Vérifier si une réaction existe déjà
        const { data: existingReaction } = await supabaseClient
            .from('post_likes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();

        // 2. Logique de changement
        if (existingReaction) {
            if (existingReaction.reaction_type === reactionType) {
                // On annule la réaction (Toggle OFF)
                const { error } = await supabaseClient
                    .from('post_likes')
                    .delete()
                    .match({ post_id: postId, user_id: user.id });
                
                if (error) throw error;

                // On supprime de la mémoire locale
                userReactions.delete(postId);
                updateMainIcon(postId, null);
            } else {
                // On change de type (ex: Heart -> Support)
                const { error } = await supabaseClient
                    .from('post_likes')
                    .update({ reaction_type: reactionType })
                    .match({ id: existingReaction.id });
                
                if (error) throw error;

                // On met à jour la mémoire locale
                userReactions.set(postId, reactionType);
                updateMainIcon(postId, reactionType);
            }
            
            // ---> C'EST ICI LE POINT CRITIQUE <---
            // On ferme le menu dès que l'action est réussie
            closeReactionPopup(postId);
            // --------------------------------
            
            showToast("Mise à jour effectuée", "success");

        } else {
            // Nouvelle réaction (Insertion)
            const { error } = await supabaseClient
                .from('post_likes')
                .insert([{
                    post_id: postId,
                    user_id: user.id,
                    reaction_type: reactionType
                }]);

            if (error) throw error;

            // On sauvegarde dans la Map
            userReactions.set(postId, reactionType);
            updateMainIcon(postId, reactionType);
            
            // ---> C'EST ICI LE POINT CRITIQUE <---
            // On ferme le menu dès que l'action est réussie
            closeReactionPopup(postId); // Note: postId suffit comme argument si la fonction gère l'ID
            // ----------------------------------
            
            showToast("Réaction enregistrée", "success");
        }

    } catch (err) {
        console.error("Erreur Réaction:", err);
        showToast("Erreur lors de la mise à jour", "danger");
    }
}

// Fonction helper pour mettre à jour l'icône principale
function updateMainIcon(postId, reactionType) {
    const icon = document.getElementById(`icon-react-${postId}`);
    
    if (!icon) return;
    
    // Si reactionType est null, on revient au style par défaut (Cœur vide ou Plein selon votre logique de likes)
    // Ici, pour simplifier, on revient à "Cœur Vide" (far fa-heart)
    if (!reactionType) {
        // Note : Si vous voulez qu'il affiche un cœur PLEIN quand l'user a liké, il faudrait vérifier 'like' explicitement
        icon.className = "far fa-heart text-slate-400 text-xl group-active:scale-125 transition-transform";
    } else {
        // Récupérer le style associé au type (Ex: Support -> Pink Heart)
        const style = REACTION_STYLES[reactionType];
        // On applique la nouvelle classe (Icon + Couleur)
        icon.className = `fas ${style.icon} ${style.color} text-xl group-active:scale-125 transition-transform`;
    }
}
/* --- 3. TAGS & MENTIONS (Highlighting) --- */
function formatTextWithHighlights(text) {
    if (!text) return '';

    // 1. Protection XSS basique (Remplacer < et > par des entités HTML)
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // 2. Remplacer les Mentions (@user)
    safeText = safeText.replace(/@(\w+)/g, '<span class="mention-highlight">@$1</span>');

    // 3. Remplacer les Tags (#hashtag)
    safeText = safeText.replace(/#(\w+)/g, '<span class="hashtag-highlight">#$1</span>');

    return safeText;
}

/* --- 4. MODE ZEN (LECTURE VIDÉO) --- */
function openZenMode(url) {
    // On utilise l'élément HTML existant au lieu d'en créer un nouveau
    const modal = document.getElementById('zen-mode-modal');
    const video = document.getElementById('zen-video-player');
    
    if (!modal || !video) {
        console.error("Element Zen Mode introuvable");
        return;
    }

    video.src = url;
    modal.classList.add('active'); // Affiche le modal via CSS
    document.body.style.overflow = 'hidden'; // Bloque le scroll du corps
    
    // Lecture automatique
    video.play().catch(e => console.log("Autoplay bloqué par le navigateur", e));
}

function closeZenMode() {
    const modal = document.getElementById('zen-mode-modal');
    const video = document.getElementById('zen-video-player');
    
    if (video) {
        video.pause();
        video.src = ''; // Vide la source pour arrêter le chargement
    }
    
    if (modal) {
        modal.classList.remove('active');
    }
    
    document.body.style.overflow = 'auto'; // Réactive le scroll
}

// --- VARIABLES GLOBALES MODALE ---
let currentModalPostId = null;

// --- NOUVELLE VERSION ROBUSTE OPEN POST MODAL ---
async function openPostModal(postId) {
    console.log("Ouverture modale pour:", postId);
    const overlay = document.getElementById('post-modal-overlay');
    if (!overlay) return;

    // 1. On affiche le conteneur immédiatement avec un style inline fort
    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    overlay.style.cssText = "display: flex !important; opacity: 1 !important; z-index: 99999 !important; pointer-events: auto !important;";
    
    // 2. On bloque le scroll du body
    document.body.style.overflow = 'hidden';

    // 3. On injecte un loader le temps du chargement
    overlay.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-black/90"><i class="fas fa-spinner fa-spin text-4xl text-white"></i></div>`;

    try {
        // Récupération des données
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { data: post, error } = await supabaseClient.from('posts').select('*').eq('id', postId).single();
        if (error) throw error;

        const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', post.user_id).single();
        currentModalPostId = postId;
        const isMyPost = (user && user.id === post.user_id);

        // 4. Injection du HTML final
        // Note: J'ai réduit les arrondis ici aussi pour la modale (rounded-2xl au lieu de 3xl)
        overlay.innerHTML = `
            <div class="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative" onclick="event.stopPropagation()">
                
                <!-- PARTIE GAUCHE : MEDIA -->
                <div class="flex-1 bg-black flex items-center justify-center relative">
                    ${post.is_short && post.video_url 
                        ? `<video src="${post.video_url}" controls autoplay class="max-h-full max-w-full"></video>` 
                        : `<img src="${post.image_url}" class="max-h-full max-w-full object-contain">`
                    }
                </div>

                <!-- PARTIE DROITE : INFOS -->
                <div class="w-full md:w-[400px] flex flex-col border-l border-slate-100 dark:border-slate-700">
                    <!-- Header -->
                    <div class="p-4 border-b dark:border-slate-700 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <img src="${profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg'}" class="w-10 h-10 rounded-full">
                            <div>
                                <div class="font-bold text-sm text-slate-900 dark:text-white">${profile?.full_name || 'Utilisateur'}</div>
                                <div class="text-xs text-slate-400">${typeof getTimeAgo === 'function' ? getTimeAgo(new Date(post.created_at)) : ''}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 relative">
                            <button onclick="toggleModalMenu()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                            <div id="modal-dropdown-menu" class="post-dropdown-menu hidden absolute top-10 right-0 bg-white dark:bg-slate-800 shadow-xl rounded-lg w-48 py-1 border dark:border-slate-700 z-50"></div>
                            <button onclick="closePostModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <!-- Corps -->
                    <div id="modal-comments-container" class="flex-1 overflow-y-auto p-4">
                        <p class="text-sm mb-4 text-slate-700 dark:text-slate-300">
                            <span class="font-bold text-slate-900 dark:text-white mr-2">${profile?.full_name || 'User'}</span> 
                            ${post.caption || ''}
                        </p>
                        <div id="modal-comments-list" class="space-y-3 text-sm"></div>
                    </div>
                    <!-- Footer -->
                    <div class="p-4 border-t dark:border-slate-700">
                        <form onsubmit="submitModalComment(event)" class="flex items-center gap-2">
                            <input type="text" id="modal-comment-input" placeholder="Commenter..." class="flex-1 text-sm outline-none bg-transparent">
                            <button type="submit" class="text-indigo-600 font-bold text-xs">Envoyer</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        renderModalMenu(isMyPost, post.user_id);

    } catch (err) {
        console.error("Erreur modale:", err);
        closePostModal();
        showToast("Impossible de charger cette publication", "error");
    }
}

// 2. Fermer la modale
function closePostModal() {
    const overlay = document.getElementById('post-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        overlay.classList.add('hidden');
        overlay.innerHTML = ''; 
    }
    document.body.style.overflow = 'auto';
}

// 3. Générer le menu (FONCTION MANQUANTE CORRIGÉE)
function renderModalMenu(isOwner, targetUserId) {
    const menu = document.getElementById('modal-dropdown-menu');
    if (!menu) return;

    if (isOwner) {
        menu.innerHTML = `
            <div onclick="deletePostAction()" class="post-dropdown-item danger">
                <i class="fas fa-trash-alt"></i> Supprimer
            </div>`;
    } else {
        menu.innerHTML = `
            <div onclick="reportPostAction()" class="post-dropdown-item danger">
                <i class="fas fa-flag"></i> Signaler
            </div>`;
    }
}

// 4. Actions simples
function toggleModalMenu() {
    const menu = document.getElementById('modal-dropdown-menu');
    if(menu) menu.classList.toggle('hidden');
}

async function deletePostAction() {
    if (!confirm("Supprimer ?")) return;
    await supabaseClient.from('posts').delete().eq('id', currentModalPostId);
    showToast("Supprimé", "success");
    closePostModal();
    if(typeof loadGlobalFeed === 'function') loadGlobalFeed();
}

function reportPostAction() {
    showToast("Signalé", "success");
    closePostModal();
}

async function submitModalComment(e) {
    e.preventDefault();
    const input = document.getElementById('modal-comment-input');
    const content = input.value.trim();
    if(!content) return;
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    await supabaseClient.from('post_comments').insert([{ user_id: user.id, post_id: currentModalPostId, content: content }]);
    input.value = '';
    showToast("Commenté", "success");
    openPostModal(currentModalPostId); // Recharge
}

// 5. Attacher les fonctions au window pour être sûr qu'elles sont accessibles globalement
window.openPostModal = openPostModal;
window.closePostModal = closePostModal;
window.toggleModalMenu = toggleModalMenu;
window.deletePostAction = deletePostAction;
window.reportPostAction = reportPostAction;
window.submitModalComment = submitModalComment;

            function handleSortClick(element, filterType) {
    const allButtons = document.querySelectorAll('.sort-btn');
    
    allButtons.forEach(btn => {
        // Reset Styles : Gris + Carré/Cercle (px-3 pour icône seule)
        btn.classList.remove('bg-blue-50', 'text-blue-600', 'dark:bg-blue-900/30', 'dark:text-blue-400');
        btn.classList.add('bg-slate-100', 'text-slate-600', 'dark:bg-slate-800', 'dark:text-slate-300');
        btn.classList.replace('px-4', 'px-3'); 
        
        const textSpan = btn.querySelector('.btn-text');
        if (textSpan) textSpan.classList.add('hidden');
    });

    // Active Style : Bleu + Largeur auto (px-4 pour texte + icône)
    element.classList.remove('bg-slate-100', 'text-slate-600', 'dark:bg-slate-800', 'dark:text-slate-300');
    element.classList.add('bg-blue-50', 'text-blue-600', 'dark:bg-blue-900/30', 'dark:text-blue-400');
    element.classList.replace('px-3', 'px-4');

    const activeText = element.querySelector('.btn-text');
    if (activeText) activeText.classList.remove('hidden');

    // Appel des fonctions de tri
    filterType === 'shorts' ? filterFeed('shorts') : sortFeed(filterType);
}
            // --- CHARGER LES INFOS DANS LE MENU SIDEBAR ---
async function loadSidebarUser() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();

        if (profile) {
            const imgEl = document.getElementById('sidebar-avatar');
            const nameEl = document.getElementById('sidebar-username');

            if (imgEl) {
                imgEl.src = profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'User')}&background=e2e8f0&color=64748b`;
            }
            if (nameEl) {
                nameEl.innerText = profile.full_name || 'Utilisateur';
            }
        }
    } catch (e) {
        console.error("Erreur chargement sidebar user:", e);
    }
}
            async function blockUser(targetUserId) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { error } = await supabaseClient
        .from('blocked_users')
        .insert([{ blocker_id: user.id, blocked_id: targetUserId }]);

    if (!error) {
        showToast("Utilisateur bloqué", "success");
        // Optionnel : Retirer ses posts du feed actuel
        document.querySelectorAll(`[data-user-id="${targetUserId}"]`).forEach(el => el.remove());
    }
}
            /* --- GESTION DU BOUTON DYNAMIQUE (VOIX / ENVOI) --- */
function toggleChatSendButton() {
    const input = document.getElementById('chat-input');
    const voiceBtn = document.getElementById('voice-btn');
    const sendBtn = document.getElementById('send-btn');

    if (!input || !voiceBtn || !sendBtn) return;

    // Si du texte est tapé (longueur > 0)
    if (input.value.trim().length > 0) {
        voiceBtn.classList.add('hidden');      // Cache Micro
        sendBtn.classList.remove('hidden');    // Affiche Envoi
    } else {
        voiceBtn.classList.remove('hidden');   // Affiche Micro
        sendBtn.classList.add('hidden');       // Cache Envoi
    }
}
            async function sendChatMessage(e) {
    if(e) e.preventDefault();
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    
    if (!content || !currentChatId) return;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    input.value = ''; 

    const tempId = 'temp-' + Date.now();
    
    // Création du message optimiste
    const tempMsg = {
        id: tempId,
        content: content,
        created_at: new Date().toISOString(),
        is_read: false // Forcé à false
    };

    const container = document.getElementById('chat-messages-container');
    
    // On utilise createMessageBubble, mais on ajoute une classe spéciale pour le retrouver
    const row = createMessageBubble(tempMsg, true); 
    row.classList.add('opacity-70'); // Légèrement transparent (envoi en cours)
    row.setAttribute('data-temp-id', tempId); // Marqueur temporaire
    
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;

    // Envoi réel
    const { error } = await supabaseClient
        .from('messages')
        .insert([{
            chat_id: currentChatId,
            sender_id: user.id,
            content: content
        }]);

    if (error) {
        showToast("Erreur d'envoi", "error");
        row.classList.add('bg-red-50'); // Erreur visuelle
    } else {
        // Succès : on enlève la transparence.
        // Note: Le listener Realtime (INSERT) va remplacer cette bulle par la version définitive.
        row.classList.remove('opacity-70');
    }
}
            let longPressTimer = null;
let selectedMessage = null;

// 1. Fonction pour attacher les écouteurs (à appeler dans createMessageBubble)
function addContextMenuListeners(element, msg) {
    // Événements tactiles (Mobile)
    element.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {
            showContextMenu(e.touches[0].clientX, e.touches[0].clientY, msg);
            navigator.vibrate(50); // Petit retour haptique
        }, 500); // 500ms pour un appui long
    }, { passive: true });

    element.addEventListener('touchend', () => clearTimeout(longPressTimer));
    element.addEventListener('touchmove', () => clearTimeout(longPressTimer));
    
    // Événement souris (Desktop - Clic droit)
    element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, msg);
    });
}

// 2. Afficher le menu
function showContextMenu(x, y, msg) {
    selectedMessage = msg;
    
    // Supprimer l'ancien menu s'il existe
    const existing = document.querySelector('.context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    
    // Positionnement intelligent (éviter de sortir de l'écran)
    menu.style.left = `${Math.min(x, window.innerWidth - 200)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - 200)}px`;

    // Contenu du menu
    menu.innerHTML = `
        <div class="context-menu-item" onclick="replyToMessage()">
            <i class="fas fa-reply text-blue-500"></i> Répondre
        </div>
        <div class="context-menu-item" onclick="copyMessage()">
            <i class="fas fa-copy text-slate-500"></i> Copier
        </div>
        <div class="context-menu-item" onclick="forwardMessage()">
            <i class="fas fa-share text-indigo-500"></i> Transférer
        </div>
        ${msg.sender_id === myId ? `
        <div class="context-menu-item" onclick="editMessage()">
            <i class="fas fa-pencil-alt text-orange-500"></i> Modifier
        </div>
        <div class="context-menu-item danger" onclick="deleteMessage()">
            <i class="fas fa-trash"></i> Supprimer
        </div>
        ` : ''}
    `;

    document.body.appendChild(menu);

    // Fermer si on clique ailleurs
    setTimeout(() => {
        document.addEventListener('click', closeContextMenu, { once: true });
    }, 10);
}

function closeContextMenu() {
    const menu = document.querySelector('.context-menu');
    if (menu) menu.remove();
}

// 3. Actions du Menu

// A. Répondre
function replyToMessage() {
    closeContextMenu();
    if (!selectedMessage) return;

    // Afficher la barre de réponse
    const replyContainer = document.getElementById('reply-container');
    const replyPreview = document.getElementById('reply-preview-text');
    
    replyPreview.innerText = selectedMessage.content.substring(0, 50);
    replyContainer.classList.remove('hidden');
    
    // Focus sur l'input
    document.getElementById('chat-input').focus();
}
function cancelReply() {
    document.getElementById('reply-container').classList.add('hidden');
    selectedMessage = null; // On réinitialise la sélection pour l'envoi
}

// B. Copier
function copyMessage() {
    closeContextMenu();
    if (!selectedMessage) return;
    navigator.clipboard.writeText(selectedMessage.content);
    showToast("Message copié", "success");
}

// C. Supprimer
async function deleteMessage() {
    closeContextMenu();
    if (!selectedMessage) return;

    if (confirm("Supprimer ce message ?")) {
        // Option 1 : Suppression réelle (si autorisé par RLS)
        const { error } = await supabaseClient
            .from('messages')
            .delete()
            .eq('id', selectedMessage.id);
        
        if (!error) {
            // Suppression visuelle
            const el = document.querySelector(`[data-msg-id="${selectedMessage.id}"]`);
            if (el) el.innerHTML = '<div class="text-center text-slate-400 italic text-xs p-2">Message supprimé</div>';
            showToast("Supprimé", "success");
        } else {
            showToast("Erreur suppression", "error");
        }
    }
}

// D. Modifier (Basique - ouvre l'input avec le texte)
function editMessage() {
    closeContextMenu();
    if (!selectedMessage) return;
    
    const input = document.getElementById('chat-input');
    input.value = selectedMessage.content;
    input.focus();
    
    // On sauvegarde qu'on est en mode édition
    window.isEditing = selectedMessage.id;
    
    showToast("Modifiez le message et envoyez", "info");
}

// E. Transférer (Ouvre la liste des contacts)
function forwardMessage() {
    closeContextMenu();
    if (!selectedMessage) return;
    
    // Logique simple : on sauvegarde le message et on va sur la liste des chats
    window.forwardContent = selectedMessage.content;
    showToast("Sélectionnez un destinataire", "info");
    switchPage('messages');
}
          /* ==========================================================
   DÉFINITION DE LA FONCTION D'INITIALISATION (GLOBALE)
   ========================================================== */
/* ==========================================================
   DÉFINITION DE LA FONCTION D'INITIALISATION (CORRIGÉE)
   ========================================================== */
async function initialiserApplication() {
    try {
        console.log("Démarrage progressif...");

        // 1. Afficher la page d'accueil immédiatement
        const homeView = document.getElementById('home-view');
        if (homeView) {
            homeView.style.display = 'block'; 
            setTimeout(() => homeView.classList.add('active'), 50);
        }

        // 2. Fonction utilitaire d'attente
        const wait = ms => new Promise(res => setTimeout(res, ms));

        // 3. Fonction de chargement cadencé ET SÉCURISÉE
        const charger = async (nom, fonction, delai) => {
            try {
                await wait(delai);
                await fonction();
                console.log(`✅ ${nom} chargé`);
            } catch (e) {
                // CORRECTION : On ignore l'erreur 'AbortError' (signifie juste qu'on a quitté la page)
                if (e.name === 'AbortError') {
                    console.log(`ℹ️ Chargement ${nom} annulé (navigation).`);
                    return;
                }
                console.warn(`⚠️ Échec ${nom}:`, e.message);
            }
        };

        // 4. Lancement des chargements
        await Promise.allSettled([
            charger("Sidebar", loadSidebarUser, 0),
            charger("Flux", loadGlobalFeed, 50),
            charger("Profil", loadSocialProfile, 150),
            charger("Notifs", loadNotifications, 300),
            charger("Messages", loadChatList, 450)
        ]);

    } catch (error) {
        // On ignore aussi ici les erreurs d'annulation globale
        if (error.name !== 'AbortError') {
            console.error("Erreur critique au démarrage :", error);
        }
    } finally {
        // 5. Afficher le contenu
        document.body.classList.remove('app-loading');
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        // 6. Cacher le loader
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }
    }
}

/* ==========================================================
   ÉCOUTEUR PRINCIPAL AU CHARGEMENT DE LA PAGE
   ========================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. VÉRIFICATION DE SESSION ---
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

    if (!session || sessionError) {
        console.log("Session expirée.");
        window.location.replace('login.html'); 
        return; 
    }

    // --- 2. CONFIGURATION INITIALE ---
    const savedLang = localStorage.getItem('printbam-lang') || 'fr';
    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = savedLang;
    
    updateLanguage(savedLang);
    setTheme(localStorage.getItem('printbam-theme') || 'light', false);

    // --- 3. LANCEMENT DE L'APPLICATION ---
    await initialiserApplication();

    // --- 4. SERVICES D'ARRIERE-PLAN ---
    
    // A. Notifications globales (Realtime)
    if (typeof initGlobalRealtimeListeners === 'function') {
        initGlobalRealtimeListeners();
    }

    // B. Badges
    updateMessageBadge();
    updateNotificationBadge();

    // --- 5. FONCTIONNALITÉS D'INTERFACE ---

    // A. Scroll Infini
    if (typeof setupInfiniteScroll === 'function') {
        setupInfiniteScroll();
    }
    
    // B. Effets visuels
    if (typeof initScrollReveal === 'function') {
        initScrollReveal();
    }

    // C. Auto-Hide Header/Dock
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const explorerBar = document.querySelector('.feed-sticky-header');
        const dock = document.querySelector('.mobile-dock');

        if (currentScrollY <= 10) return;

        if (currentScrollY > lastScrollY && currentScrollY > 50) {
            if (explorerBar) explorerBar.classList.add('nav-hidden');
            if (dock) dock.classList.add('nav-hidden');
        } else {
            if (explorerBar) explorerBar.classList.remove('nav-hidden');
            if (dock) dock.classList.remove('nav-hidden');
        }
        lastScrollY = currentScrollY;
    }, { passive: true });
    
    // D. Swipe Retour (Messages)
    const messagesView = document.getElementById('messages-view');
    if (messagesView) {
        let touchStartX = 0;
        messagesView.addEventListener('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
        }, false);

        messagesView.addEventListener('touchend', function(event) {
            const touchEndX = event.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 120) {
                switchPage('home');
            }
        }, false);
    }

    // ============================================================
    // --- E. GESTION DE LA PRÉSENCE EN LIGNE (STATUT) ---
    // ============================================================
    
    // 1. Mise à jour immédiate
    if (typeof updateMyPresence === 'function') {
        updateMyPresence(); 
    }

    // 2. Répétition toutes les 30 secondes
    setInterval(() => {
        if (typeof updateMyPresence === 'function') {
            updateMyPresence();
        }
    }, 30000);

    // 3. Mise à jour au retour sur l'onglet
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            if (typeof updateMyPresence === 'function') {
                updateMyPresence();
            }
            updateMessageBadge();
        }
    });

});
            // Ouvrir la modale
function openNewChatModal() {
    const modal = document.getElementById('new-chat-modal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    loadPotentialContacts(); // Charger la liste
}

// Fermer la modale
function closeNewChatModal() {
    const modal = document.getElementById('new-chat-modal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

// Charger les abonnés et suivis
async function loadPotentialContacts() {
    const container = document.getElementById('new-chat-list');
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    container.innerHTML = `<div class="text-center py-10 text-slate-400"><i class="fas fa-spinner fa-spin"></i></div>`;

    try {
        // 1. Récupérer les gens que je suis (followings)
        const { data: followings } = await supabaseClient
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

        // 2. Récupérer mes abonnés (followers)
        const { data: followers } = await supabaseClient
            .from('follows')
            .select('follower_id')
            .eq('following_id', user.id);

        // Fusionner les IDs uniques
        const ids = new Set();
        followings?.forEach(f => ids.add(f.following_id));
        followers?.forEach(f => ids.add(f.follower_id));
        
        // Enlever mon propre ID
        ids.delete(user.id);

        if (ids.size === 0) {
            container.innerHTML = `<div class="text-center py-10 text-slate-400">Vous n'avez pas encore d'abonnés.</div>`;
            return;
        }

        // 3. Récupérer les profils
        const idsArray = Array.from(ids);
        const { data: profiles } = await supabaseClient
            .from('profiles')
            .select('id, full_name, avatar_url, is_certified')
            .in('id', idsArray);

        // 4. Afficher
        container.innerHTML = profiles.map(p => {
    // Protection contre les caractères spéciaux dans le nom
    const safeName = p.full_name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const avatarUrl = p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=random`;

    return `
    <div class="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition group">
        <div class="flex items-center gap-3 cursor-pointer flex-1" onclick="viewUserProfile('${p.id}')">
            <div class="relative">
                <img src="${avatarUrl}" 
                     onerror="this.src='https://ui-avatars.com/api/?name=?';" 
                     class="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                     alt="${safeName}">
                ${p.is_online ? '<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>' : ''}
            </div>
            <div class="flex flex-col">
                <div class="flex items-center gap-1">
                    <span class="font-semibold text-sm text-slate-900 dark:text-slate-100">${safeName}</span>
                    ${p.is_certified ? '<i class="fas fa-check-circle text-blue-500 text-[10px]" title="Compte certifié"></i>' : ''}
                </div>
                <span class="text-[10px] text-slate-500 truncate max-w-[120px]">Membre vérifié</span>
            </div>
        </div>
        
        <div class="flex items-center gap-2">
            <button onclick="closeNewChatModal(); startChat('${p.id}')" 
                    class="btn-sky-yellow px-4 py-1.5 rounded-full text-xs font-bold transform active:scale-95 transition-transform shadow-sm"
                    aria-label="Envoyer un message à ${safeName}">
                Message
            </button>
        </div>
    </div>
    `;
}).join('');
    } catch (err) {
        console.error("Erreur chargement contacts:", err);
    }
}         
         // --- GESTION RECONNEXION REALTIME ---
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log("App active : Re-synchronisation...");
        
        // 1. Relancer la présence
        if (typeof updateMyPresence === 'function') updateMyPresence();
        
        // 2. Rafraîchir les badges et listes
        if (typeof updateMessageBadge === 'function') updateMessageBadge();
        
        // 3. Forcer le rechargement de la liste des messages si on est sur la page chat
        const chatView = document.getElementById('chat-view');
        if (chatView && chatView.classList.contains('active')) {
            if (typeof loadChatList === 'function') loadChatList();
        }
    }
});
async function chargerPosts() {
    const container = document.getElementById('posts-container');

    // 1. Tenter de charger depuis le stockage local (Cache Immédiat)
    const localData = localStorage.getItem('cached_posts');
    if (localData) {
        renderPosts(JSON.parse(localData)); // On affiche tout de suite les vieux posts
        console.log("Mode Pro : Affichage des données locales en attendant le réseau...");
    }

    try {
        // 2. Aller chercher les données fraîches sur Supabase
        const { data: freshPosts, error } = await supabaseClient
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 3. Mettre à jour le stockage local pour la prochaine fois
        localStorage.setItem('cached_posts', JSON.stringify(freshPosts));

        // 4. Mettre à jour l'écran avec les nouvelles données
        renderPosts(freshPosts);
        console.log("Mode Pro : Données synchronisées avec le serveur.");

    } catch (err) {
        console.error("Erreur de synchro :", err);
        if (!localData) {
            container.innerHTML = "<p>Erreur de connexion et aucune donnée en cache.</p>";
        }
    }
}
