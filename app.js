import { GoogleGenerativeAI } from "https://cdn.jsdelivr.net/npm/@google/generative-ai@0.21.0/+esm";

const router = {
    screens: ['home', 'ai-agent', 'map', 'tours', 'camera', 'metro', 'bus', 'taxi', 'terminal', 'hola-barcelona', 't-casual', 'alojamiento', 'place-details', 'all-markets', 'network-map'],
    currentScreen: null,
    currentParams: null,
    chatHistory: [],
    geminiApiKey: "", // REEMPLAZAR CON TU API KEY
    geminiModel: null,

    async initGemini() {
        console.log("Iniciando Gemini...");
        if (this.geminiApiKey === "TU_API_KEY_AQUI" || !this.geminiApiKey) {
            console.error("API Key no configurada correctamente");
            return;
        }
        
        try {
            const genAI = new GoogleGenerativeAI(this.geminiApiKey);
            this.geminiModel = genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                systemInstruction: "Eres un asistente de IA experto en turismo para la ciudad de Barcelona dentro de la app 'Stitch'. Tu objetivo es ayudar a los turistas a navegar por la ciudad, recomendar lugares emblemáticos, restaurantes locales, mercados (especialmente La Boqueria) y explicar cómo usar el transporte público (Metro L9 Sud, Autobuses TMB, Taxi). Eres amable, profesional y tus respuestas son concisas pero informativas y con un toque de hospitalidad catalana. Responde siempre en español."
            });
            console.log("Gemini inicializado correctamente con gemini-2.0-flash");
        } catch (error) {
            console.error("Error al inicializar Gemini:", error);
        }
    },
    places: {
        'sagrada-familia': {
            name: 'Sagrada Família',
            dist: '1.2 km',
            desc: 'La obra maestra inacabada de Antoni Gaudí, un templo único en el mundo por su arquitectura orgánica y simbolismo espiritual.',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW_nlZcAGQei0pzOy7EVxyHozsba1pfqBjNWn1EEbqNreAAtVpiWDHO31IIrBQv4So1lFD4B7LTMS3ycpHieRfmR2cHqrWejmuhPOYkUh4oXBZ_93F7a99YFWpLSOpfUmOMe9lIHYNtlnUbWUAqor_k3A7RF75IPBCK2bR04Z-rWwZ7z9L5mAh1x3lm8hoytQjkvQP-SgtacuycEBuRgOoBQPP-2Nys32twdJx3S1kDdzGrl2w64SNTlfDYs65xMCfRm5608P4UaQ',
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
        // Initial load check for personal name
        const userName = localStorage.getItem('userName');
        let hash = window.location.hash.substring(1) || 'home';
        let [screen, params] = hash.split('?');
        
        if (!userName && screen !== 'onboarding') {
            this.navigate('onboarding');
        } else {
            this.navigate(screen, true, params);
        }

        // Start Clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        // Start Weather
        this.updateWeather();
        setInterval(() => this.updateWeather(), 600000); // 10 minutes
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
            }

            if (screen === 'ai-agent') {
                this.setupAIAgent();
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
                        if (!this.geminiModel) {
                            await this.initGemini();
                        }
                        
                        if (this.geminiModel) {
                            const result = await this.geminiModel.generateContent(text);
                            const response = await result.response;
                            typingIndicator.remove();
                            appendMessage(response.text(), false);
                        } else {
                            throw new Error("API Key no configurada");
                        }
                    } catch (error) {
                        console.error("Error en Gemini response:", error);
                        typingIndicator.remove();
                        appendMessage("Error: " + error.message + ". Por favor, verifica tu conexión y la API Key.", false);
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
        }

        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
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
