  /* =====================================================
           DICTIONNAIRE DE TRADUCTION (MOTEUR)
        ===================================================== */
        const translations = {
            fr: {
                nav_navigation: "Navigation", nav_home: "Accueil", nav_market: "Marketplace", nav_services: "Services",
                nav_account: "Compte", nav_orders: "Mes Commandes", nav_settings: "Paramètres", nav_help: "Aide",
                nav_login: "Connexion", btn_start: "Démarrer",
                hero_status: "Système Opérationnel",
                hero_title_part1: "L'infrastructure", hero_title_part2: "documentaire", hero_title_highlight: "haute performance.",
                hero_desc: "Digitalisez vos flux, nous matérialisons l'excellence avec une",
                btn_print_now: "Imprimer maintenant", btn_demo: "Voir la démo",
                feat_arch_title: "Architecture Documentaire", feat_arch_desc: "Traitement architectural de vos documents. Précision au millimètre pour vos manuscrits exigeants et mémoires académiques.",
                feat_delivery: "Livraison Express",
                feat_badge_title: "Badges PVC", feat_badge_desc: "Cartes de service haute définition avec protection thermique et codage magnétique.",
                feat_cloud_title: "Infrastructure Cloud", feat_cloud_desc: "Envoyez vos fichiers de n'importe où. Notre réseau sécurisé s'occupe du traitement et de l'impression.",
                portfolio_title: "Standards d'Excellence.", btn_all: "Tout voir",
                card1_cat: "Rapports", card1_title: "Rapports Institutionnels", card1_desc: "Papier couché 120g avec reliure thermique invisible pour une finition premium.",
                card2_cat: "Identité Visuelle", card2_title: "Cartes de Membre", card2_desc: "Impression sublimation haute résistance avec hologramme de sécurité personnalisé.",
                card3_cat: "Technique", card3_title: "Plans & Blueprints", card3_desc: "Traçage grand format A0/A1 haute précision sur papier technique translucide.",
                cta_title: "Prêt pour l'impression ?", btn_launch_order: "Lancer une commande",
                promo_tag: "Offre Académique", promo_title: "Pack Thèse & Mémoire", promo_desc: "Saisie assistée, correction et mise en page normes APA/ISO.", btn_benefit: "Profiter",
                corp_title: "Partenariat Corporate", corp_desc: "Externalisez votre flux documentaire. Facturation mensuelle, gestionnaire de compte dédié et API d'intégration.", btn_contact_sales: "Contacter ventes",
                footer_about: "L'infrastructure d'impression cloud leader en Afrique centrale. Fiabilité, rapidité et sécurité pour vos documents.", footer_services: "Services", footer_company: "Entreprise", footer_contact: "Contact",
                settings_profile: "Votre Profil", settings_notifs: "Notifications push", settings_lang: "Langue", settings_save: "Sauvegarder",
                btn_send: "Envoyer",
                typewriter_words: ["précision chirurgicale.", "vitesse absolue.", "sécurité bancaire.", "design élégant."]
            },
            en: {
                nav_navigation: "Navigation", nav_home: "Home", nav_market: "Marketplace", nav_services: "Services",
                nav_account: "Account", nav_orders: "My Orders", nav_settings: "Settings", nav_help: "Help",
                nav_login: "Login", btn_start: "Get Started",
                hero_status: "System Operational",
                hero_title_part1: "The high-performance", hero_title_part2: "document", hero_title_highlight: "infrastructure.",
                hero_desc: "Digitize your workflows, we materialize excellence with",
                btn_print_now: "Print Now", btn_demo: "View Demo",
                feat_arch_title: "Document Architecture", feat_arch_desc: "Architectural processing of your documents. Millimeter precision for demanding manuscripts and academic theses.",
                feat_delivery: "Express Delivery",
                feat_badge_title: "PVC Badges", feat_badge_desc: "High definition service cards with thermal protection and magnetic coding.",
                feat_cloud_title: "Cloud Infrastructure", feat_cloud_desc: "Send files from anywhere. Our secure network takes care of processing and printing.",
                portfolio_title: "Standards of Excellence.", btn_all: "View All",
                card1_cat: "Reports", card1_title: "Institutional Reports", card1_desc: "120g coated paper with invisible thermal binding for a premium finish.",
                card2_cat: "Visual Identity", card2_title: "Membership Cards", card2_desc: "High resistance sublimation printing with personalized security hologram.",
                card3_cat: "Technical", card3_title: "Plans & Blueprints", card3_desc: "Large format A0/A1 high precision tracing on translucent technical paper.",
                cta_title: "Ready to print?", btn_launch_order: "Launch an Order",
                promo_tag: "Academic Offer", promo_title: "Thesis & Memory Pack", promo_desc: "Assisted typing, correction and layout per APA/ISO standards.", btn_benefit: "Benefit",
                corp_title: "Corporate Partnership", corp_desc: "Outsource your document flow. Monthly billing, dedicated account manager and API integration.", btn_contact_sales: "Contact Sales",
                footer_about: "The leading cloud printing infrastructure in Central Africa. Reliability, speed and security for your documents.", footer_services: "Services", footer_company: "Company", footer_contact: "Contact",
                settings_profile: "Your Profile", settings_notifs: "Push Notifications", settings_lang: "Language", settings_save: "Save",
                btn_send: "Send",
                typewriter_words: ["surgical precision.", "absolute speed.", "banking security.", "elegant design."]
            },
            ln: { // Lingala (Approximations)
                nav_navigation: "Boluki", nav_home: "Esika", nav_market: "Bisika", nav_services: "Misala",
                nav_account: "Bokomi", nav_orders: "Mikanda", nav_settings: "Ndimi", nav_help: "Lisungi",
                nav_login: "Kokota", btn_start: "Yuka",
                hero_status: "Sistème Ebalé",
                hero_title_part1: "Bokoli ya", hero_title_part2: "bukundu", hero_title_highlight: "ya makasi.",
                hero_desc: "Botia bisusu na nzela ya électronique, biso tokoki kobimisa eloko ya makasi na",
                btn_print_now: "Kobima Sika", btn_demo: "Tala Demo",
                feat_arch_title: "Bokoli ya Mbete", feat_arch_desc: "Botia ya mbete ya mikanda na yo. Mbote ya likolo koleka mbuma na ba manuscrit.",
                feat_delivery: "Komesa Mbote",
                feat_badge_title: "Ba Badge ya PVC", feat_badge_desc: "Ba carte ya service ya molenge mingi na maboko ya masano ya moto.",
                feat_cloud_title: "Sistème ya Cloud", feat_cloud_desc: "Tinda ba fichier awa na awa. Réseau na biso ezo talala misala ya botia.",
                portfolio_title: "Ndimi ya Makasi.", btn_all: "Tala Binso",
                card1_cat: "Babui", card1_title: "Babui ya Etat", card1_desc: "Papier ya 120g na reliure thermique invisible.",
                card2_cat: "Bolimbisi ya Nsango", card2_title: "Ba Carte ya Membres", card2_desc: "Impression ya sublimation ya mbote na hologramme ya salisa.",
                card3_cat: "Mikanda", card3_title: "Plans & Blueprints", card3_desc: "Impression ya grand format A0/A1 ya likolo.",
                cta_title: "Oyo ozali kokoba ?", btn_launch_order: "Sima Commande",
                promo_tag: "Offre ya Mokili Mobimba", promo_title: "Pack ya Thèse & Mémoire", promo_desc: "Botia ya lisusu, correction na layout.", btn_benefit: "Tia Moko",
                corp_title: "Bokabwani bisika ya Bakompani", corp_desc: "Tia mikanda na bisika ya bakompani. Liputa na mobu,.", btn_contact_sales: "Komisa Vente",
                footer_about: "L'infrastructure d'impression cloud leader en Afrique centrale.", footer_services: "Misala", footer_company: "Kompani", footer_contact: "Komisa",
                settings_profile: "Lingomba na yo", settings_notifs: "Notifications", settings_lang: "Lokota", settings_save: "Tia",
                btn_send: "Tinda",
                typewriter_words: ["mbote ya ekolo.", "vitesse ya sika.", "sécurité ya mbanki.", "design ya elenge."]
            },
            tu: { // Tshiluba (Approximations)
                nav_navigation: "Buvui", nav_home: "Kadi", nav_market: "Kabuadi", nav_services: "Miyila",
                nav_account: "Ditumbu", nav_orders: "Babui", nav_settings: "Mwididi", nav_help: "Lubulayi",
                nav_login: "Kuluka", btn_start: "Yuka",
                hero_status: "System Kupona",
                hero_title_part1: "Buvui ya", hero_title_part2: "mutundu", hero_title_highlight: "wa bule.",
                hero_desc: "Dija masalu a eletronique, biso twa ku bubaja butashi wa bule na",
                btn_print_now: "Bubaja Ubu", btn_demo: "Kajia",
                feat_arch_title: "Buvui wa Mutundu", feat_arch_desc: "Dija mutundu wa babui wa nu. Bupi bu hine.",
                feat_delivery: "Kumesha Bubi",
                feat_badge_title: "Ba Badge ya PVC", feat_badge_desc: "Ba Carte ya mulonga wa buli.",
                feat_cloud_title: "Sistème ya Cloud", feat_cloud_desc: "Tuma ba fichier kuna a kuna.",
                portfolio_title: "Miyila wa Bule.", btn_all: "Kajia Bionso",
                card1_cat: "Babui", card1_title: "Babui wa Etat", card1_desc: "Papier wa 120g.",
                card2_cat: "Bulayi wa Nsango", card2_title: "Ba Carte wa Mabaka", card2_desc: "Impression wa sublimation.",
                card3_cat: "Miyila", card3_title: "Plans & Blueprints", card3_desc: "Impression wa grand format.",
                cta_title: "Waba udi bubaja ?", btn_launch_order: "Simula Babui",
                promo_tag: "Offre wa Mokili", promo_title: "Pack wa Thèse & Mémoire", promo_desc: "Kubaja kuluka.", btn_benefit: "Jita",
                corp_title: "Kabwani wa Mabaka", corp_desc: "Dija masalu wa mabaka.", btn_contact_sales: "Komisa Vente",
                footer_about: "Infrastructure wa bubaja.", footer_services: "Miyila", footer_company: "Mabaka", footer_contact: "Komisa",
                settings_profile: "Ditumbu dyawe", settings_notifs: "Notifications", settings_lang: "Lokota", settings_save: "Tia",
                btn_send: "Tuma",
                typewriter_words: ["bupi bu hine.", "vitesse wa bule.", "sécurité wa mbanki.", "design wa buli."]
            },
            sw: { // Swahili (Approximations)
                nav_navigation: "Miondoko", nav_home: "Nyumbani", nav_market: "Soko", nav_services: "Huduma",
                nav_account: "Akaunti", nav_orders: "Oda", nav_settings: "Mipangilio", nav_help: "Msaada",
                nav_login: "Ingia", btn_start: "Anza",
                hero_status: "Mfumo Umeanzika",
                hero_title_part1: "Miundombinu ya", hero_title_part2: "waraka", hero_title_highlight: "ya nguvu.",
                hero_desc: "Badilisha mchakato wako, sisi tunaleta uzuri wa",
                btn_print_now: "Chapisha Sasa", btn_demo: "Tazama Demo",
                feat_arch_title: "Usanifu wa Waraka", feat_arch_desc: "Usindikaji wa waraka wako.",
                feat_delivery: "Uwasilishaji wa Haraka",
                feat_badge_title: "Beji ya PVC", feat_badge_desc: "Kadi za huduma za ubora wa juu.",
                feat_cloud_title: "Miundombinu ya Wingu", feat_cloud_desc: "Tuma faili popote pale.",
                portfolio_title: "Vigezo vya Ubora.", btn_all: "Onyotesha Vyote",
                card1_cat: "Ripoti", card1_title: "Ripoti za Taasisi", card1_desc: "Karatasi iliyofunikwa 120g.",
                card2_cat: "Utambulisho", card2_title: "Kadi za Wanachama", card2_desc: "Uchapishaji wa sublimation wenye nguvu.",
                card3_cat: "Kiufundi", card3_title: "Mipango & Blueprints", card3_desc: "Uchapishaji wa ukubwa wa A0/A1.",
                cta_title: "Uko tayari kuchapisha?", btn_launch_order: "Anza Oda",
                promo_tag: "Kutoa ya Akademiki", promo_title: "Kifungu cha Thesis & Memory", promo_desc: "Usaidizi wa kuandika.", btn_benefit: "Faidika",
                corp_title: "Ushirikiano wa Kampuni", corp_desc: "Toa mfumo wako wa waraka.", btn_contact_sales: "Wasiliana na Mauzo",
                footer_about: "Miundombinu ya uchapishaji wa wingu kinara.", footer_services: "Huduma", footer_company: "Kampuni", footer_contact: "Wasiliana",
                settings_profile: "Wasifu wako", settings_notifs: "Arifa za Push", settings_lang: "Lugha", settings_save: "Hifadhi",
                btn_send: "Tuma",
                typewriter_words: ["usahihi wa upasuaji.", "kasi ya kila.", "usalama wa benki.", "muundo wa kupendeza."]
            },
            kg: { // Kikongo (Approximations)
                nav_navigation: "Zina", nav_home: "Mboka", nav_market: "Mpemba", nav_services: "Nsadila",
                nav_account: "Ntangu", nav_orders: "Bisalu", nav_settings: "Nkidila", nav_help: "Lusadisu",
                nav_login: "Vata", btn_start: "Yuka",
                hero_status: "Sistema Kukota",
                hero_title_part1: "Bukundu wa", hero_title_part2: "nkandu", hero_title_highlight: "wa nene.",
                hero_desc: "Tia zina a eletronique, biso twa ku kanga mpete wa nene na",
                btn_print_now: "Buka Mboka", btn_demo: "Vata",
                feat_arch_title: "Bukundu wa Nkandu", feat_arch_desc: "Dija nkandu.",
                feat_delivery: "Komesa Mbote",
                feat_badge_title: "Ba Badge ya PVC", feat_badge_desc: "Ba Carte ya nsadila.",
                feat_cloud_title: "Sistema ya Cloud", feat_cloud_desc: "Tuma ba fichier awa.",
                portfolio_title: "Nkidila wa Nene.", btn_all: "Vata Zina",
                card1_cat: "Bisalu", card1_title: "Bisalu ya Etat", card1_desc: "Papier ya 120g.",
                card2_cat: "Mpete ya Nsango", card2_title: "Ba Carte wa Bakoko", card2_desc: "Impression wa sublimation.",
                card3_cat: "Nsadila", card3_title: "Plans & Blueprints", card3_desc: "Impression wa grand format.",
                cta_title: "Yaka udi buka ?", btn_launch_order: "Yuka Bisalu",
                promo_tag: "Komesa ya Ntotila", promo_title: "Pack wa Thèse & Mémoire", promo_desc: "Buka.", btn_benefit: "Vata",
                corp_title: "Kabwani wa Bakompani", corp_desc: "Tia zina wa bakompani.", btn_contact_sales: "Komisa Vente",
                footer_about: "Infrastructure wa buka.", footer_services: "Nsadila", footer_company: "Kompani", footer_contact: "Komisa",
                settings_profile: "Mvuila mu nzo", settings_notifs: "Notifications", settings_lang: "Lota", settings_save: "Kumbuka",
                btn_send: "Tuma",
                typewriter_words: ["bupi bu nene.", "vitesse wa bule.", "sécurité wa mbanki.", "design wa nene."]
            }
        };

        /* =====================================================
           CONFIGURATION & INIT
        ===================================================== */
        document.addEventListener('DOMContentLoaded', () => {
            try {
                if(typeof emailjs !== 'undefined') {
                    emailjs.init("thg5rkoV_YE3VuWnU");
                }
            } catch (e) {
                console.warn("EmailJS non chargé");
            }

            // Init Langue
            const savedLang = localStorage.getItem('printbam-lang') || 'fr';
            const langSelect = document.getElementById('language-select');
            if(langSelect) langSelect.value = savedLang;

            // Appliquer la langue au démarrage
            updateLanguage(savedLang);

            const savedTheme = localStorage.getItem('printbam-theme');
            if (savedTheme === 'dark') {
                setTheme('dark', false);
            } else {
                setTheme('light', false);
            }

            setTimeout(() => {
                const loader = document.getElementById('loader');
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
            }, 1500); // Un peu plus long pour admirer l'animation

            initScrollReveal();
        });

        /* =====================================================
           LOGIQUE DE TRADUCTION
        ===================================================== */
        function changeLanguage(lang) {
            localStorage.setItem('printbam-lang', lang);
            updateLanguage(lang);
            
            const langNames = {
                'fr': 'Français', 'en': 'English', 'ln': 'Lingala',
                'tu': 'Tshiluba', 'sw': 'Swahili', 'kg': 'Kikongo'
            };
            showToast(`Langue : ${langNames[lang]}`, 'success');
        }

        function updateLanguage(lang) {
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (translations[lang] && translations[lang][key]) {
                    el.textContent = translations[lang][key];
                }
            });

            if (translations[lang] && translations[lang].typewriter_words) {
                window.currentWords = translations[lang].typewriter_words;
            }
        }

        /* =====================================================
           THEME LOGIC
        ===================================================== */
        function setTheme(theme, save = true) {
            const btnLight = document.getElementById('btn-light');
            const btnDark = document.getElementById('btn-dark');
            const body = document.body;

            if (theme === 'dark') {
                body.classList.add('dark-mode');
                if(btnDark) {
                    btnDark.classList.remove('text-slate-500', 'bg-transparent');
                    btnDark.classList.add('bg-white', 'text-slate-800', 'shadow-sm');
                }
                if(btnLight) {
                    btnLight.classList.add('text-slate-500', 'bg-transparent');
                    btnLight.classList.remove('bg-white', 'text-slate-800', 'shadow-sm');
                }
            } else {
                body.classList.remove('dark-mode');
                if(btnLight) {
                    btnLight.classList.remove('text-slate-500', 'bg-transparent');
                    btnLight.classList.add('bg-white', 'text-slate-800', 'shadow-sm');
                }
                if(btnDark) {
                    btnDark.classList.add('text-slate-500', 'bg-transparent');
                    btnDark.classList.remove('bg-white', 'text-slate-800', 'shadow-sm');
                }
            }

            if (save) localStorage.setItem('printbam-theme', theme);
        }

        /* =====================================================
           UI TOGGLES (CORRIGÉ)
        ===================================================== */
        function toggleSidebar() {
            const mainContent = document.getElementById('main-content');
            const panel = document.getElementById('sidebar-panel');
            const overlay = document.getElementById('sidebar-overlay');
            const bg = document.getElementById('sidebar-bg');
            
            // CORRECTION: Sélectionner le dock mobile
            const dock = document.querySelector('.mobile-dock');
            
            const isOpen = !overlay.classList.contains('invisible');

            if (!isOpen) {
                overlay.classList.remove('invisible');
                setTimeout(() => {
                    bg.classList.replace('opacity-0', 'opacity-100');
                    panel.classList.replace('-translate-x-full', 'translate-x-0');
                    panel.classList.replace('opacity-0', 'opacity-100');
                }, 10);
                
                if(mainContent) {
                    mainContent.style.transform = 'translateX(280px) scale(0.95)';
                    mainContent.style.filter = 'blur(2px) brightness(0.9)';
                    mainContent.style.borderRadius = '24px';
                    mainContent.style.pointerEvents = 'none'; 
                }

                // CORRECTION FORCÉE : Cacher le dock avec 'important'
                if(dock) dock.style.setProperty('display', 'none', 'important');

            } else {
                bg.classList.replace('opacity-100', 'opacity-0');
                panel.classList.replace('translate-x-0', '-translate-x-full');
                panel.classList.replace('opacity-100', 'opacity-0');

                if(mainContent) {
                    mainContent.style.transform = 'translateX(0) scale(1)';
                    mainContent.style.filter = 'blur(0) brightness(1)';
                    mainContent.style.borderRadius = '0';
                    mainContent.style.pointerEvents = 'auto';
                }

                // CORRECTION FORCÉE : Remontrer le dock (laisser le CSS gérer)
                if(dock) dock.style.removeProperty('display');

                setTimeout(() => {
                    overlay.classList.add('invisible');
                }, 500);
            }
        }

        function genericToggle(overlayId, panelId, bgClass) {
            const overlay = document.getElementById(overlayId);
            const panel = document.getElementById(panelId);
            const bg = overlay.querySelector(bgClass);

            if (overlay.classList.contains('invisible')) {
                overlay.classList.remove('invisible');
                setTimeout(() => {
                    bg.classList.replace('opacity-0', 'opacity-100');
                    panel.classList.replace('translate-x-full', 'translate-x-0');
                }, 10);
            } else {
                bg.classList.replace('opacity-100', 'opacity-0');
                panel.classList.replace('translate-x-0', 'translate-x-full');
                setTimeout(() => overlay.classList.add('invisible'), 500);
            }
        }

        function toggleSettings() { genericToggle('settings-overlay', 'settings-panel', 'div:first-child'); }
        function toggleSupport() { genericToggle('support-overlay', 'support-panel', 'div:first-child'); }
        
        function toggleOrders() {
            renderOrders();
            genericToggle('orders-overlay', 'orders-panel', 'div:first-child');
        }

        /* =====================================================
           TOAST NOTIFICATION SYSTEM
        ===================================================== */
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            let icon = type === 'success' ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500';
            
            toast.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="fas ${icon} text-lg"></i>
                    <span class="font-medium text-slate-700">${message}</span>
                </div>
                <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600">
                    <i class="fas fa-times"></i>
                </button>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }

        /* =====================================================
           TYPEWRITER EFFECT
        ===================================================== */
        window.currentWords = window.currentWords || ["précision chirurgicale.", "vitesse absolue.", "sécurité bancaire.", "design élégant."]; // Default French
        
        const typeTarget = document.getElementById('typewriter');
        if (typeTarget) {
            let wordIndex = 0, charIndex = 0, deleting = false;

            function typeLoop() {
                const words = window.currentWords;
                const word = words[wordIndex];
                typeTarget.textContent = deleting ? word.substring(0, --charIndex) : word.substring(0, ++charIndex);
                let delay = deleting ? 50 : 100;

                if (!deleting && charIndex === word.length) { deleting = true; delay = 2000; }
                if (deleting && charIndex === 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 500; }
                setTimeout(typeLoop, delay);
            }
            typeLoop();
        }

        /* =====================================================
           SCROLL LOGIC & ANIMATIONS
        ===================================================== */
        function initScrollReveal() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
        }

        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const current = window.scrollY;
            const nav = document.getElementById('nav-main');
            const mobileHeader = document.getElementById('mobile-header');

            if (nav) {
                if(current > 50) {
                    nav.classList.add('py-3');
                    nav.classList.remove('py-6');
                } else {
                    nav.classList.remove('py-3');
                    nav.classList.add('py-6');
                }

                if(current > lastScroll && current > 200) {
                    nav.style.transform = 'translateY(-100%)';
                } else {
                    nav.style.transform = 'translateY(0)';
                }
            }

            if(mobileHeader) {
                if(current > 20) mobileHeader.classList.add('header-scrolled');
                else mobileHeader.classList.remove('header-scrolled');
            }

            lastScroll = current;
        });

        // Parallax Background
        const bgGrid = document.getElementById('parallax-bg');
        if(bgGrid) {
            window.addEventListener('mousemove', e => {
                const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
                const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
                bgGrid.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        }

        /* =====================================================
           ORDERS LOGIC (LOCALSTORAGE)
        ===================================================== */
        let orders = JSON.parse(localStorage.getItem('printbam_orders')) || [];

        function saveNewOrder(docName, price) {
            const newOrder = {
                id: 'PB-' + Math.floor(Math.random() * 9000 + 1000),
                date: new Date().toLocaleDateString('fr-FR'),
                item: docName,
                amount: price,
                status: 'En cours'
            };
            orders.unshift(newOrder);
            localStorage.setItem('printbam_orders', JSON.stringify(orders));
        }

        function renderOrders() {
            const list = document.getElementById('orders-list');
            const totalDisplay = document.getElementById('total-spent');
            
            if (orders.length === 0) {
                list.innerHTML = `
                    <div class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 pt-10">
                        <i class="fas fa-box-open text-4xl text-slate-800"></i>
                        <p class="text-xs font-bold uppercase tracking-widest text-slate-800">Aucune commande</p>
                    </div>`;
                totalDisplay.innerText = "0 FC";
                return;
            }

            list.innerHTML = '';
            let total = 0;

            orders.forEach((order, index) => {
                total += order.amount;
                list.innerHTML += `
                    <div class="glass p-4 flex items-center justify-between group hover:border-indigo-200 transition-all" style="animation: slideIn 0.3s ease ${index * 0.1}s forwards; opacity: 0; transform: translateY(10px);">
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] font-black text-indigo-600 uppercase">${order.id}</span>
                            <span class="text-sm font-bold text-slate-900">${order.item}</span>
                            <span class="text-[10px] text-slate-400">${order.date}</span>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                            <span class="text-sm font-black text-slate-900">${order.amount.toLocaleString()} FC</span>
                            <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[8px] font-bold uppercase tracking-tighter border border-indigo-100">
                                ${order.status}
                            </span>
                        </div>
                    </div>
                `;
            });
            totalDisplay.innerText = total.toLocaleString() + " FC";
        }

        let clearStep = 0;
        function confirmClearHistory() {
            const btn = document.getElementById('btn-clear-history');
            if (clearStep === 0) {
                clearStep = 1;
                btn.innerText = "Confirmer ?";
                btn.classList.add('bg-red-50', 'border-red-200');
                setTimeout(() => { if(clearStep === 1) resetClearBtn(); }, 3000);
            } else {
                orders = [];
                localStorage.removeItem('printbam_orders');
                renderOrders();
                showToast('Historique vidé', 'success');
                resetClearBtn();
            }
        }

        function resetClearBtn() {
            const btn = document.getElementById('btn-clear-history');
            clearStep = 0;
            btn.innerText = "Vider l'historique";
            btn.classList.remove('bg-red-50', 'border-red-200');
        }

        /* =====================================================
           SUPPORT FORM
        ===================================================== */
        function handleSupportSubmit(event) {
            event.preventDefault();
            
            const btn = document.getElementById('btn-send-support');
            const form = document.getElementById('support-form');
            const successMsg = document.getElementById('support-success');

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-circle-notch animate-spin"></i> <span>Transmission...</span>';

            if(typeof emailjs !== 'undefined') {
                const params = {
                    subject: form.querySelector('select').value,
                    message: form.querySelector('textarea').value,
                    from_name: "Client PrintBam",
                };
            }

            setTimeout(() => {
                form.classList.add('hidden');
                successMsg.classList.remove('hidden');
                form.reset();
                btn.disabled = false;
                btn.innerHTML = '<span>Envoyer</span><i class="fas fa-paper-plane text-[10px]"></i>';
                showToast("Message envoyé au support !", "success");
            }, 1500);
        }
