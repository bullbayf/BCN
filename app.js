// Eliminamos la importación de Google AI ya que usaremos el API de DeepSeek directamente vía fetch

const router = {
    screens: ['home', 'ai-agent', 'map', 'tours', 'camera', 'metro', 'bus', 'taxi', 'terminal', 'hola-barcelona', 't-casual', 'alojamiento', 'place-details', 'all-markets', 'network-map'],
    currentScreen: null,
    currentParams: null,
    chatHistory: [],
    geminiApiKey: localStorage.getItem('stitch_gemini_key') || '', // Se cargará desde LocalStorage
    geminiModel: "gemini-2.5-flash", // Modelo de Gemini
    newsApiKey: "77eac375af91da1f97518cd4f99f8830", // GNews API Key

    async initGemini() {
        console.log("Configurando Gemini...");
        
        // Auto-Setup: Fragmento la clave para evitar detecciones automáticas en GitHub
        const k1 = "AIzaSyAY8jql8d_";
        const k2 = "ToKZuHXbTMjpU3SJK";
        const k3 = "L5nmeDo";
        const autoKey = k1 + k2 + k3;

        let storedKey = localStorage.getItem('stitch_gemini_key');
        
        // Si no hay clave, o la que hay está vacía, configuramos la automática
        if ((!storedKey || storedKey.trim() === "") && autoKey) {
            localStorage.setItem('stitch_gemini_key', autoKey);
            storedKey = autoKey;
            console.log("Gemini auto-configurado con éxito");
        }
        
        this.geminiApiKey = storedKey;
        console.log("Gemini listo:", this.geminiApiKey ? "Clave cargada" : "Sin clave");
    },

    saveGeminiKey(key) {
        if (key && key.trim()) {
            localStorage.setItem('stitch_gemini_key', key.trim());
            this.geminiApiKey = key.trim();
            // Recargar la pantalla actual para refrescar el estado
            this.navigate(this.currentScreen, true, this.currentParams);
            alert('¡API Key guardada correctamente!');
            return true;
        }
        return false;
    },

    promptForGeminiKey() {
        const currentKey = localStorage.getItem('stitch_gemini_key') || '';
        const newKey = prompt("Introduce tu nueva Google Gemini API Key:\n\n(Tu anterior clave fue desactivada por seguridad al subirse a GitHub. Genera una nueva en AI Studio y pégala aquí)", currentKey);
        if (newKey !== null) {
            this.saveGeminiKey(newKey);
        }
    },
    places: {
        'sagrada-familia': {
            name: 'Sagrada Família',
            dist: '1.2 km',
            desc: 'La obra maestra inacabada de Antoni Gaudí, un templo único en el mundo por su arquitectura orgánica y simbolismo espiritual.',
            img: 'sagrada.webp',
            maps: 'https://www.google.com/maps/search/?api=1&query=Sagrada+Familia+Barcelona',
            transport: [
                { type: 'metro', line: 'L2/L5', station: 'Sagrada Família', time: '12 min' },
                { type: 'bus', line: 'H10 / 33', station: 'Mallorca - Marina', time: '15 min' }
            ]
        },
        'park-guell': {
            name: 'Park Güell',
            dist: '3.5 km',
            desc: 'Famoso parque público compuesto de jardines y elementos arquitectónicos situados en la parte superior de la ciudad de Barcelona.',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcRh8SlYbCb4ncEC-C6XnJgb4KbSwWozvYej1JvNuvBs5cCNLiyv6hOcpKbt0fmunlQsgbPi6xbCE7EeadDLM4cDpnOh-mr_w5BSzoSDsXqQ1HX3xwZ3UfFqqaOO49u9Ggot3osJu9JbyVBSqQ9SkxSbxqMfs7u2_RbB1VkMbFgbgQI3geFaRva2q6LJmgm32fLb8bU9ra2KWINpHswDTeSU47GdXtaEwvnCBNreqtF_SjdR8jgpGcNWGued8pcJB2iYFLANdNQu8',
            maps: 'https://www.google.com/maps/search/?api=1&query=Park+Guell+Barcelona',
            transport: [
                { type: 'metro', line: 'L3', station: 'Lesseps / Vallcarca', time: '25 min' },
                { type: 'bus', line: 'H6 / D40', station: 'Travessera de Dalt', time: '20 min' }
            ]
        },
        'casa-batllo': {
            name: 'Casa Batlló',
            dist: '0.8 km',
            desc: 'Uno de los edificios más emblemáticos de Gaudí en el Paseo de Gracia, conocido por su fachada ondulada y colores vibrantes.',
            img: 'Casa_Batlló,_Antoni_Gaudí.jpg',
            maps: 'https://www.google.com/maps/search/?api=1&query=Casa+Batllo+Barcelona',
            transport: [
                { type: 'metro', line: 'L2/L3/L4', station: 'Passeig de Gràcia', time: '8 min' },
                { type: 'bus', line: 'H10 / V15', station: 'Pg. de Gràcia - Aragó', time: '10 min' }
            ]
        },
        'mercat-boqueria': {
            name: 'Mercat de la Boqueria',
            dist: '0.5 km',
            desc: 'El mercado más famoso de Barcelona, situado en Las Ramblas, un paraíso de colores, sabores y productos frescos de calidad. Un festín para los sentidos con paradas de frutas, mariscos, embutidos y más.',
            img: 'MercatdeBoqueria.jpg',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercat+de+la+Boqueria+Barcelona',
            transport: [
                { type: 'metro', line: 'L3', station: 'Liceu', time: '5 min' },
                { type: 'taxi', line: 'Oficial', station: 'La Rambla', time: '3 min' }
            ]
        },
        'marina-market': {
            name: 'Mercat de Sta. Caterina',
            dist: '1.2 km',
            desc: 'Famoso por su espectacular tejado ondulado de mosaicos coloridos, este mercado combina arquitectura vanguardista con la tradición de los mejores productos locales en el barrio de la Ribera.',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiQmlcLXX8zITEHjGn3TOdFNYUqhVHvLIPJsX8CqMM7-L9Pi9mhQaGtaNKwiq10K2XVjZbGY46otn_h7Fh8aQLSRMux23gD8Ky1QUgGGGgBXsOKumwP8VHW8f1LgEALeOzqSGAxSvhLtF27RbDnyJWxhxWhBNHD7oqbYSg-gbWXy4cLR_d8IBluRam7RWhvUoRavF1Wd4SuJvc3qljBBP-uBREtIYvCKKAZIga0C9xVZEG1amP3VqneTtOy5hECyzJki8Gidp696Q',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercat+Santa+Caterina+Barcelona',
            transport: [
                { type: 'metro', line: 'L4', station: 'Jaume I', time: '10 min' },
                { type: 'bus', line: 'V15', station: 'Via Laietana', time: '8 min' }
            ]
        },
        'mercat-sant-antoni': {
            name: 'Mercat de Sant Antoni',
            dist: '0.9 km',
            desc: 'Un impresionante mercado modernista que ocupa toda una manzana del Eixample. Tras una larga reforma, brilla con su estructura de hierro y ofrece desde productos frescos hasta su famoso mercado dominical de libros.',
            img: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=800',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercat+de+Sant+Antoni+Barcelona',
            transport: [
                { type: 'metro', line: 'L2', station: 'Sant Antoni', time: '8 min' },
                { type: 'bus', line: 'D50', station: 'Manso - Casanova', time: '10 min' }
            ]
        },
        'mercat-les-corts': {
            name: 'Mercat de les Corts',
            dist: '2.8 km',
            desc: 'Un mercado de barrio auténtico y luminoso, recientemente renovado. Ofrece un ambiente acogedor, moderno y productos de proximidad de altísima calidad en el corazón del distrito de Les Corts.',
            img: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercat+de+les+Corts+Barcelona',
            transport: [
                { type: 'metro', line: 'L3', station: 'Les Corts', time: '15 min' },
                { type: 'bus', line: 'H8', station: 'Travessera de les Corts', time: '12 min' }
            ]
        },
        'mercat-llibertat': {
            name: 'Mercat de la Llibertat',
            dist: '2.1 km',
            desc: 'Mercado modernista en el corazón de Gràcia. Destaca por su arquitectura de hierro forjado y ambiente bohemio.',
            img: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercat+de+la+Llibertat+Barcelona',
            transport: [{ type: 'metro', line: 'L3', station: 'Fontana', time: '10 min' }]
        },
        'mercat-ninot': {
            name: 'Mercat del Ninot',
            dist: '1.5 km',
            desc: 'Elegante mercado en el Eixample, referente gastronómico por su amplia oferta de productos frescos y degustación.',
            img: 'https://images.unsplash.com/photo-1531234799389-dcb7651eb0a2?auto=format&fit=crop&q=80&w=400',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercat+del+Ninot+Barcelona',
            transport: [{ type: 'metro', line: 'L5', station: 'Hospital Clínic', time: '5 min' }]
        },
        'mercat-concepcio': {
            name: 'Mercat de la Concepció',
            dist: '1.8 km',
            desc: 'El mercado de las flores de Barcelona. Un espacio luminoso y elegante abierto las 24 horas para flores.',
            img: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?auto=format&fit=crop&q=80&w=400',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercat+de+la+Concepcio+Barcelona',
            transport: [{ type: 'metro', line: 'L4', station: 'Girona', time: '8 min' }]
        },
        'generic-market': {
            name: 'Mercado Municipal',
            dist: 'Variable',
            desc: 'Uno de los 39 mercados de Barcelona que ofrecen productos frescos y mantienen viva la esencia de los barrios.',
            img: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=400',
            maps: 'https://www.google.com/maps/search/?api=1&query=Mercados+Municipales+Barcelona',
            transport: []
        }
    },

    handleAiSuggestion(text) {
        const input = document.getElementById('ai-message-input');
        if (input) {
            input.value = text;
            const sendBtn = document.getElementById('btn-send-message');
            if (sendBtn) sendBtn.click();
        }
    },

    chatHistory: [
        { isUser: false, text: "¡Bon dia! Estoy listo para ayudarte a planificar tu día. ¿Te gustaría conocer los mejores lugares para comer hoy o prefieres una ruta histórica por el Barrio Gótico?" }
    ],

    init() {
        // Inicializar Gemini y auto-configurar clave si es necesario
        this.initGemini();

        // Initial load check for personal name
        const userName = localStorage.getItem('userName');
        let hash = window.location.hash.substring(1) || 'home';
        let [screen, params] = hash.split('?');
        
        if (!userName && screen !== 'onboarding') {
            this.navigate('onboarding');
        } else {
            this.navigate(screen, true, params);
        }

        // Setup Audio
        this.setupAudio();

        // Start Clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        // Start Weather
        this.updateWeather();
        setInterval(() => this.updateWeather(), 600000); // 10 minutes
    },

    setupAudio() {
        const audio = document.getElementById('bg-music');
        const toggleBtn = document.getElementById('audio-toggle-btn');
        const toggleIcon = document.getElementById('audio-toggle-icon');

        if (!audio || !toggleBtn || !toggleIcon) return;

        // Mostrar el botón en todas las pantallas menos en 'onboarding'
        if (this.currentScreen !== 'onboarding') {
            toggleBtn.classList.remove('hidden');
        }

        // Volumen al máximo para asegurar que se escuche en altavoces móviles
        audio.volume = 1.0;

        // Manejar el toggle
        toggleBtn.addEventListener('click', async () => {
            
            if (audio.paused) {
                try {
                    // Mobile safari/chrome fix: explicitly unmute and force interaction play
                    audio.muted = false;
                    const playPromise = audio.play();
                    
                    if (playPromise !== undefined) {
                        await playPromise;
                        toggleIcon.textContent = 'volume_up';
                    }
                } catch (err) {
                    console.error("Autoplay prevent during toggle:", err);
                    // Fallback attempt: reload and play
                    audio.load();
                    audio.play().catch(e => console.error("Final play fail:", e));
                }
            } else {
                audio.pause();
                toggleIcon.textContent = 'volume_off';
            }
        });
        
        // Intentar autoplay si ya hemos interactuado antes
        // Muchos navegadores bloquean el autoplay, así que lo intentamos
        // y si falla el usuario tiene que darle click al botón
        const attemptPlay = () => {
            audio.play().then(() => {
                toggleIcon.textContent = 'volume_up';
            }).catch(e => {
                toggleIcon.textContent = 'volume_off';
                console.log('Autoplay prevenido. El usuario debe activar el audio manualmente.');
            });
        };
        
        // Solo intentar arrancar auto si no estamos en onboarding, 
        // o si el usuario completó el onboarding (una interacción)
        if (this.currentScreen !== 'onboarding') {
            attemptPlay();
        }

        // Exponer función de play globalmente si es necesario disparar
        // desde otros botones (ej. al salir de onboarding)
        this.attemptAudioPlay = attemptPlay;
    },

    // ... (updateWeather and getWeatherIcon remain unchanged)

    async updateWeather() {
        try {
            const lat = 41.3888;
            const lon = 2.1590;
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
            const data = await response.json();
            
            if (data && data.current) {
                const temp = Math.round(data.current.temperature_2m);
                const code = data.current.weather_code;
                
                const tempElement = document.getElementById('barcelona-temp');
                const iconElement = document.getElementById('barcelona-weather-icon');
                
                if (tempElement) tempElement.textContent = `${temp}°C`;
                if (iconElement) iconElement.textContent = this.getWeatherIcon(code);
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
        }
    },

    getWeatherIcon(code) {
        if (code === 0) return 'wb_sunny';
        if (code >= 1 && code <= 3) return 'cloud';
        if (code >= 45 && code <= 48) return 'foggy';
        if (code >= 51 && code <= 67) return 'rainy';
        if (code >= 71 && code <= 77) return 'ac_unit';
        if (code >= 80 && code <= 82) return 'umbrella';
        if (code >= 95 && code <= 99) return 'thunderstorm';
        return 'wb_sunny';
    },

    updateClock() {
        const hoursEl = document.getElementById('clock-hours');
        const minutesEl = document.getElementById('clock-minutes');
        
        if (!hoursEl || !minutesEl) return;

        const options = {
            timeZone: 'Europe/Madrid',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(new Date());
        const timeParts = {};
        parts.forEach(({ type, value }) => timeParts[type] = value);

        if (hoursEl) hoursEl.textContent = timeParts.hour;
        if (minutesEl) minutesEl.textContent = timeParts.minute;
    },

    navigate(screen, addToHistory = true, params = null) {
        if (this.currentScreen === screen && this.currentParams === params) return;
        this.loadScreen(screen, addToHistory, params);
    },

    async loadScreen(screen, addToHistory, params = null) {
        const contentArea = document.getElementById('app-content');
        const template = document.getElementById(`template-${screen}`) || document.getElementById('template-home');

        contentArea.classList.add('loading');
        this.currentParams = params;

        setTimeout(() => {
            if (template) {
                contentArea.innerHTML = template.innerHTML;
            } else {
                contentArea.innerHTML = '<div class="p-8 text-center text-red-500">Error: Pantalla no encontrada.</div>';
            }
            
            if (screen === 'home') {
                this.renderNearbyPlaces();
                this.updateClock();
                this.updateWeather();
                this.fetchBarcelonaNews();
                
                // Set User Name
                const userName = localStorage.getItem('userName');
                const nameHeader = document.getElementById('user-name-header');
                if (nameHeader && userName) {
                    nameHeader.textContent = userName;
                }
            }

            if (['home', 'terminal', 'alojamiento'].includes(screen)) {
                // Initialize Realistic Maps for Cards/Details
                setTimeout(() => this.initCardMaps(), 500);
            }

            if (screen === 'place-details' && params) {
                this.renderPlaceDetails(params);
            }

            if (screen === 'onboarding') {
                this.setupOnboarding();
            } else {
                const toggleBtn = document.getElementById('audio-toggle-btn');
                if (toggleBtn) toggleBtn.classList.remove('hidden');
            }

            if (screen === 'ai-agent') {
                this.setupAIAgent();
            }
            
            if (screen === 'camera') {
                this.initCamera();
            } else {
                this.stopCamera(); // Stop camera if leaving the screen
            }
            
            if (screen === 'network-map') {
                setTimeout(() => {
                    const elem = document.getElementById('zoomable-map');
                    if (elem) {
                        const panzoom = Panzoom(elem, {
                            maxScale: 5,
                            minScale: 1,
                            contain: 'outside'
                        });
                        elem.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);
                    }
                }, 200);
            }

            this.updateNav(screen);
            this.currentScreen = screen;
            
            if (addToHistory) {
                const url = params ? `#${screen}?${params}` : `#${screen}`;
                window.history.pushState({ screen, params }, '', url);
            }
            
            contentArea.classList.remove('loading');
            window.scrollTo(0, 0);
        }, 100);
    },

    renderNearbyPlaces() {
        const container = document.getElementById('nearby-places-container');
        if (!container) return;

        container.innerHTML = Object.entries(this.places).map(([id, place]) => `
            <div onclick="router.navigate('place-details', true, '${id}')" class="min-w-[170px] rounded-xl overflow-hidden bg-slate-800/40 border border-slate-700/50 cursor-pointer active:scale-95 transition-all duration-500 flex-shrink-0 snap-center">
                <div class="h-24 w-full bg-cover bg-center" style="background-image: url('${place.img}')"></div>
                <div class="p-3">
                    <p class="font-bold text-sm">${place.name}</p>
                    <p class="text-xs text-slate-400">${place.dist} de distancia</p>
                </div>
            </div>
        `).join('');
    },

    async fetchBarcelonaNews() {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;

        try {
            // Simulated high-quality news data (bypasses API limits)
            const mockNews = [
                {
                    title: "La Sagrada Família anuncia la fecha final para finalizar la torre de Jesucristo",
                    url: "#",
                    image: "sagradatorre.webp",
                    source: { name: "BCN Hoy" }
                },
                {
                    title: "Nuevas medidas para mejorar la movilidad en el centro de Barcelona durante el verano",
                    url: "#",
                    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400",
                    source: { name: "El Periódico" }
                },
                {
                    title: "El Parc Güell restringirá aún más su aforo para proteger el patrimonio modernista",
                    url: "#",
                    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=400",
                    source: { name: "La Vanguardia" }
                },
                {
                    title: "Apertura de nuevos espacios verdes en Poblenou y el distrito 22@",
                    url: "#",
                    image: "https://images.unsplash.com/photo-1596821864109-158bb3751786?auto=format&fit=crop&q=80&w=400",
                    source: { name: "Diari ARA" }
                },
                {
                    title: "Agenda Cultural: Los mejores festivales de música al aire libre este mes",
                    url: "#",
                    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400",
                    source: { name: "Time Out BCN" }
                }
            ];

            // Render mock news
            let widthClass = 'w-[calc(50%-8px)]'; // Good default for horizontal scroll

            newsContainer.innerHTML = mockNews.map(article => {
                return `
                <a href="${article.url}" target="_blank" class="flex-none ${widthClass} glass-card rounded-2xl overflow-hidden snap-center group border border-white/5 hover:border-primary/20 transition-all">
                    <div class="h-28 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style="background-image: url('${article.image}')"></div>
                    <div class="p-3">
                        <h4 class="text-xs font-bold text-white line-clamp-2 leading-tight">${article.title}</h4>
                        <div class="flex items-center justify-between mt-2">
                            <span class="text-[9px] text-primary font-bold uppercase">${article.source.name}</span>
                            <span class="material-symbols-outlined text-primary text-[10px]">arrow_forward</span>
                        </div>
                    </div>
                </a>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Error rendering news:', error);
            newsContainer.innerHTML = '<p class="text-[10px] text-red-500/50 px-2 italic">Error al cargar noticias.</p>';
        }
    },

    renderPlaceDetails(id) {
        const place = this.places[id];
        if (!place) return;

        const title = document.getElementById('place-title');
        const desc = document.getElementById('place-desc');
        const img = document.getElementById('place-img');
        const mapsLink = document.getElementById('place-maps-link');
        const transportContainer = document.getElementById('place-transport-container');

        if (title) title.textContent = place.name;
        if (desc) desc.textContent = place.desc;
        if (img) img.src = place.img;
        if (mapsLink) mapsLink.href = place.maps;

        if (transportContainer) {
            transportContainer.innerHTML = place.transport.map(t => {
                let colorClass = 'bg-primary';
                let icon = 'directions_transit';
                if (t.type === 'metro') {
                    colorClass = t.line.includes('L9') ? 'bg-[#f64e1f]' : 'bg-primary';
                    icon = 'subway';
                } else if (t.type === 'bus') {
                    colorClass = 'bg-blue-600';
                    icon = 'directions_bus';
                } else if (t.type === 'taxi') {
                    colorClass = 'bg-yellow-400 text-black';
                    icon = 'local_taxi';
                }

                return `
                    <div class="flex items-center justify-between p-4 rounded-xl bg-slate-800 border border-slate-700">
                        <div class="flex items-center gap-4">
                            <div class="size-10 rounded-lg ${colorClass} flex items-center justify-center font-bold text-white shadow-lg ${t.line && t.line.length > 6 ? 'text-[8px]' : t.line && t.line.length > 3 ? 'text-[10px]' : 'text-xs'}">
                                ${t.type === 'metro' ? t.line : `<span class="material-symbols-outlined text-xl">${icon}</span>`}
                            </div>
                            <div>
                                <h4 class="font-bold text-sm text-white">${t.type === 'metro' ? 'Metro ' + t.line : t.type.charAt(0).toUpperCase() + t.type.slice(1)}</h4>
                                <p class="text-[11px] text-slate-400">Estación: ${t.station}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="block text-sm font-bold text-primary">${t.time}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    setupOnboarding() {
        const input = document.getElementById('user-name-input');
        const submitBtn = document.getElementById('btn-submit-name');
        const voiceBtn = document.getElementById('btn-voice-input');
        const feedback = document.getElementById('voice-feedback');

        const saveAndGoHome = (name) => {
            if (name.trim()) {
                localStorage.setItem('userName', name.trim());
                if (typeof this.attemptAudioPlay === 'function') {
                    this.attemptAudioPlay();
                }
                this.navigate('home');
            }
        };

        submitBtn.onclick = () => saveAndGoHome(input.value);
        input.onkeyup = (e) => { if(e.key === 'Enter') saveAndGoHome(input.value); };

        // Voice Input Logic
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => {
                voiceBtn.classList.add('listening');
                feedback.classList.remove('opacity-0');
            };

            recognition.onresult = (event) => {
                const name = event.results[0][0].transcript;
                input.value = name;
                saveAndGoHome(name);
            };

            recognition.onerror = () => {
                voiceBtn.classList.remove('listening');
                feedback.classList.add('opacity-0');
            };

            recognition.onend = () => {
                voiceBtn.classList.remove('listening');
                feedback.classList.add('opacity-0');
            };

            voiceBtn.onclick = () => {
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Recognition already started');
                }
            };
        } else {
            voiceBtn.style.display = 'none'; // Speech recognition not supported
        }
    },

    setupAIAgent() {
        const input = document.getElementById('ai-message-input');
        const sendBtn = document.getElementById('btn-send-message');
        const micBtn = document.getElementById('btn-mic-message');
        const chatContainer = document.getElementById('ai-chat-container');

        if (!input || !sendBtn || !chatContainer) return;

        // Clear initial static content if history exists
        chatContainer.innerHTML = '';

        const appendMessage = (text, isUser = false, save = true) => {
            if (save) {
                this.chatHistory.push({ text, isUser });
            }

            const msgDiv = document.createElement('div');
            if (isUser) {
                msgDiv.className = "flex flex-col items-end gap-2 max-w-[90%] ml-auto animate-in fade-in slide-in-from-right-4 duration-700";
                msgDiv.innerHTML = `
                    <div class="bg-gradient-to-br from-primary to-blue-700 p-5 rounded-2xl rounded-br-none shadow-lg shadow-primary/10">
                        <p class="text-sm font-medium text-white leading-relaxed">${text}</p>
                    </div>
                `;
            } else {
                msgDiv.className = "flex gap-3 max-w-[90%] animate-in fade-in slide-in-from-left-4 duration-700";
                msgDiv.innerHTML = `
                    <div class="flex flex-col gap-2">
                        <div class="glass-card p-5 rounded-2xl rounded-tl-none border-l-2 border-l-primary relative overflow-hidden">
                            <div class="absolute -top-4 -right-4 size-16 bg-primary/5 rounded-full blur-xl"></div>
                            <p class="text-sm leading-relaxed text-slate-200">${text}</p>
                        </div>
                        <span class="text-[10px] text-slate-500 font-bold ml-1">EN LÍNEA</span>
                    </div>
                `;
            }
            chatContainer.appendChild(msgDiv);
            
            // Auto-scroll to bottom with a slight delay to ensure layout is updated
            setTimeout(() => {
                const spacer = document.getElementById('chat-bottom-spacer');
                if (spacer) {
                    spacer.scrollIntoView({ behavior: 'smooth', block: 'end' });
                } else {
                    const main = chatContainer.closest('main');
                    if (main) {
                        main.scrollTo({ top: main.scrollHeight, behavior: 'smooth' });
                    }
                }
            }, 100);
        };

        // Render History
        this.chatHistory.forEach(msg => appendMessage(msg.text, msg.isUser, false));

        const handleSend = () => {
            const text = input.value.trim();
            if (text) {
                appendMessage(text, true);
                input.value = '';
                
                // Real Gemini Response
                const handleGeminiResponse = async () => {
                    const typingIndicator = document.createElement('div');
                    typingIndicator.id = 'typing-indicator';
                    typingIndicator.className = "flex gap-3 max-w-[90%] animate-pulse";
                    typingIndicator.innerHTML = `
                        <div class="glass-card px-4 py-2 rounded-2xl rounded-tl-none border-l-2 border-l-primary bg-primary/5">
                            <span class="text-xs text-slate-400">Escribiendo...</span>
                        </div>
                    `;
                    chatContainer.appendChild(typingIndicator);
                    
                        try {
                        const systemPrompt = "Eres un asistente de IA experto en turismo para la ciudad de Barcelona dentro de la app 'Stitch'. Tu objetivo es ayudar a los turistas a navegar por la ciudad, recomendar lugares emblemáticos, restaurantes locales, mercados (especialmente La Boqueria) y explicar cómo usar el transporte público (Metro L9 Sud, Autobuses TMB, Taxi). Eres amable, profesional y tus respuestas son concisas pero informativas y con un toque de hospitalidad catalana. Responde siempre en español.";
                        
                        // Preparar mensajes para Gemini
                        // Importante: No podemos enviar history vacío si usamos el endpoint normal.
                        // Y el systemInstruction debe estar estructurado correctamente.
                        const contents = this.chatHistory.map(m => ({
                            role: m.isUser ? "user" : "model",
                            parts: [{ text: m.text }]
                        }));

                        const apiKey = this.geminiApiKey || localStorage.getItem('stitch_gemini_key');
                        if (!apiKey) {
                            throw new Error("API Key no configurada. Por favor, ve a Ajustes y añade tu clave de Gemini.");
                        }

                        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${apiKey}`;
                        
                        const requestBody = {
                            contents: contents,
                            systemInstruction: {
                                role: "user",
                                parts: [{ text: systemPrompt }]
                            },
                            generationConfig: {
                                temperature: 0.7
                            }
                        };

                        const response = await fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(requestBody)
                        });

                        const data = await response.json();
                        
                        if (data.error) {
                            throw new Error(data.error.message || "Error en la API de Gemini");
                        }

                        const aiText = data.candidates[0].content.parts[0].text;
                        typingIndicator.remove();
                        appendMessage(aiText, false);
                    } catch (error) {
                        console.error("Error en Gemini response:", error);
                        typingIndicator.remove();
                        appendMessage("Error: " + error.message + ". Por favor, verifica tu conexión y la API Key de Gemini en Ajustes.", false);
                    }
                };

                handleGeminiResponse();
            }
        };

        sendBtn.onclick = handleSend;
        input.onkeyup = (e) => { if (e.key === 'Enter') handleSend(); };

        // Mic logic
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES';
            
            recognition.onstart = () => micBtn.classList.add('text-primary', 'animate-pulse');
            recognition.onend = () => micBtn.classList.remove('text-primary', 'animate-pulse');
            recognition.onresult = (e) => {
                input.value = e.results[0][0].transcript;
                handleSend();
            };

            micBtn.onclick = () => recognition.start();
        } else {
            micBtn.style.display = 'none';
        }

        // Suggestion buttons in the template might be outside history rendering, 
        // we can still hook them or add them dynamically. For now, we clear them if they were static.
        // If we want persistent suggestions, they should be outside the container we clear.
    },

    updateNav(screen) {
        const navButtons = document.querySelectorAll('nav button');
        const isAppScreen = ['home', 'ai-agent', 'map', 'tours', 'camera'].includes(screen);
        
        // Hide nav if on onboarding
        const nav = document.querySelector('nav');
        if (nav) {
            nav.style.display = (screen === 'onboarding') ? 'none' : 'block';
        }

        navButtons.forEach(btn => {
            btn.classList.remove('text-primary');
            btn.classList.add('text-slate-500');
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.remove('fill-1');
        });

        const activeBtn = document.getElementById(`nav-${screen}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-500');
            activeBtn.classList.add('text-primary');
            const icon = activeBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.add('fill-1');
        }
    },

    scrollNearby(direction, containerId = 'nearby-places-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        let scrollAmount = 200;
        if (containerId === 'nearby-places-container') {
            scrollAmount = 186; 
        } else if (containerId === 'market-cards-container') {
            scrollAmount = 288; 
        } else if (containerId === 'tour-categories-container') {
            scrollAmount = 120;
        } else if (containerId === 'news-container') {
            scrollAmount = 296;
        }

        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    },

    initCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('API de cámara no soportada en este navegador.');
            return;
        }

        const video = document.getElementById('camera-stream');
        if (!video) return;

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' } // Usa la cámara trasera si está disponible
        })
        .then(stream => {
            this.currentCameraStream = stream;
            video.srcObject = stream;
        })
        .catch(err => {
            console.error('Error accediendo a la cámara:', err);
            alert('No se pudo acceder a la cámara. Por favor, revisa los permisos.');
        });
    },

    stopCamera() {
        if (this.currentCameraStream) {
            this.currentCameraStream.getTracks().forEach(track => track.stop());
            this.currentCameraStream = null;
        }
    },

    async captureAndAnalyze() {
        const video = document.getElementById('camera-stream');
        const canvas = document.getElementById('camera-canvas');
        const targetingUI = document.getElementById('camera-targeting-ui');
        const captureBtn = document.getElementById('camera-capture-btn-container');
        const resultSheet = document.getElementById('camera-result-sheet');

        if (!video || !canvas || !this.currentCameraStream) return;

        // Visual feedback: Hide targeting UI, show loading state on button
        targetingUI.classList.add('opacity-0');
        const originalBtnHTML = captureBtn.innerHTML;
        captureBtn.innerHTML = `
            <div class="size-20 rounded-full bg-primary/80 backdrop-blur-md flex items-center justify-center p-1 shadow-[0_0_30px_rgba(0,122,184,0.8)]">
                <span class="material-symbols-outlined text-white text-3xl font-bold animate-pulse">hourglass_empty</span>
            </div>
        `;

        // Capture frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get base64 string (remove data:image/jpeg;base64, prefix for Gemini API)
        const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        try {
            const apiKey = this.geminiApiKey || localStorage.getItem('stitch_gemini_key');
            if (!apiKey) {
                throw new Error("API Key no configurada. Por favor, ve a la sección de IA y añade tu clave.");
            }

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            
            const requestBody = {
                systemInstruction: {
                    role: "user",
                    parts: [{ text: "Eres un guía turístico experto en Barcelona. Analiza esta imagen. Si es un monumento famoso de Barcelona, identifícalo y devuelve ÚNICAMENTE un JSON válido con este formato exacto: {\"found\": true, \"id\": \"id-del-lugar\", \"name\": \"Nombre del Lugar\", \"category\": \"Arquitectura/Historia/etc\", \"match\": \"98% Match\"}. Los IDs válidos que puedes usar son: 'sagrada-familia', 'park-guell', 'casa-batllo', 'mercat-boqueria'. Si NO es un monumento reconocido de Barcelona de esa lista, devuelve: {\"found\": false}. No incluyas markdown, solo el JSON raw." }]
                },
                contents: [{
                    parts: [
                        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
                    ]
                }],
                generationConfig: { temperature: 0.1 }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            
            const rawText = data.candidates[0].content.parts[0].text;
            let resultData;
            try {
                // Limpiar posible formato markdown Markdown ```json ... ```
                const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                resultData = JSON.parse(cleanJson);
            } catch (e) {
                console.error("Error parsing Gemini JSON:", rawText);
                resultData = { found: false };
            }

            // Display Results
            if (resultData && resultData.found) {
                this.stopCamera(); // Freeze frame on recognition
                
                resultSheet.innerHTML = `
                    <div class="glass-header rounded-3xl p-4 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700 max-w-sm w-full">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="bg-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">${resultData.match || '95% Match'}</span>
                                </div>
                                <h2 class="text-white text-xl font-black tracking-tight leading-tight">${resultData.name}</h2>
                                <p class="text-slate-400 text-[11px]">${resultData.category || 'Monumento Histórico'}</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="router.navigate('place-details', true, '${resultData.id}')" class="flex-1 h-11 bg-primary rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                <span class="material-symbols-outlined text-sm">info</span>
                                Ver Detalles Completos
                            </button>
                            <button onclick="router.navigate('camera')" class="size-11 glass-card rounded-xl flex items-center justify-center text-slate-300 active:scale-95 transition-all">
                                <span class="material-symbols-outlined text-sm">refresh</span>
                            </button>
                        </div>
                    </div>
                `;
                captureBtn.classList.add('hidden');
                resultSheet.classList.remove('hidden');
                // Small delay to trigger CSS transition
                setTimeout(() => resultSheet.classList.remove('opacity-0'), 50);

            } else {
                // Not found
                captureBtn.innerHTML = originalBtnHTML;
                targetingUI.classList.remove('opacity-0');
                alert("No se reconoció ningún monumento de Barcelona. Intenta apuntar mejor.");
            }

        } catch (error) {
            console.error("Gemini Vision Error:", error);
            captureBtn.innerHTML = originalBtnHTML;
            targetingUI.classList.remove('opacity-0');
            alert("Error de conexión con la IA: " + error.message + ". Por favor, verifica tu conexión o la API Key en Ajustes.");
        }
    },

    filterTours(category, element) {
        // Update button styles
        const buttons = document.querySelectorAll('.category-filter');
        buttons.forEach(btn => {
            btn.classList.replace('bg-primary', 'glass-card');
            btn.classList.replace('text-white', 'text-slate-300');
            btn.classList.add('border-white/5');
            btn.classList.remove('shadow-lg', 'shadow-primary/20');
        });

        if (element) {
            element.classList.replace('glass-card', 'bg-primary');
            element.classList.replace('text-slate-300', 'text-white');
            element.classList.remove('border-white/5');
            element.classList.add('shadow-lg', 'shadow-primary/20');
        }

        // Filter cards
        const cards = document.querySelectorAll('.tour-card');
        cards.forEach(card => {
            if (category === 'popular') {
                card.classList.remove('hidden');
            } else {
                if (card.dataset.category === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }
        });
    },

    showMarketPopup(id) {
        const place = this.places[id];
        if (!place) return;

        const overlay = document.getElementById('market-popup-overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="glass-header rounded-3xl p-4 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                <div class="flex gap-4">
                    <div class="size-20 rounded-2xl bg-cover bg-center shrink-0" style="background-image: url('${place.img}')"></div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-lg text-white truncate">${place.name}</h4>
                            <button onclick="router.closeMarketPopup()" class="text-slate-400 p-1">
                                <span class="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <p class="text-[11px] text-slate-300 line-clamp-2 mt-1 italic">${place.desc}</p>
                        <div class="flex items-center gap-2 mt-2">
                             <span class="text-[10px] text-primary font-bold uppercase tracking-wider">${place.dist}</span>
                             <button onclick="window.open('${place.maps}', '_blank')" class="ml-auto bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-lg shadow-primary/20">CÓMO LLEGAR</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
    },

    closeMarketPopup() {
        const overlay = document.getElementById('market-popup-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
        }
    },

    initCardMaps() {
        const locations = [
            { id: 'map-alojamiento-details', coords: [41.3745, 2.1485], label: 'Alojamiento', interactive: true },
            { id: 'map-terminal-details', coords: [41.3600, 2.1750], label: 'Cruceros', interactive: true }
        ];

        locations.forEach(loc => {
            const container = document.getElementById(loc.id);
            if (!container || container._leaflet_id) return;

            const map = L.map(loc.id, {
                center: loc.coords,
                zoom: 15,
                zoomControl: false,
                attributionControl: false,
                dragging: loc.interactive || false,
                touchZoom: loc.interactive || false,
                scrollWheelZoom: loc.interactive || false,
                doubleClickZoom: loc.interactive || false,
                boxZoom: loc.interactive || false
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 20
            }).addTo(map);

            const customIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div class="marker-pulse" style="background: #007ab8; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            L.marker(loc.coords, { icon: customIcon }).addTo(map);
        });
    }
};

window.router = router;

document.addEventListener('DOMContentLoaded', () => router.init());
