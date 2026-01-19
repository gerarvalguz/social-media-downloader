document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const pasteBtn = document.getElementById('pasteBtn');
    const btnText = downloadBtn.querySelector('.btn-text');
    const btnIcon = downloadBtn.querySelector('.btn-icon');
    const spinner = downloadBtn.querySelector('.spinner');
    const messageArea = document.getElementById('messageArea');
    // Modals
    const resultModal = document.getElementById('resultModal');
    const closeResultModal = document.getElementById('closeResultModal');

    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiHostInput = document.getElementById('apiHostInput');
    const apiUrlInput = document.getElementById('apiUrlInput');
    const apiMethodInput = document.getElementById('apiMethodInput');

    const corsProxyInput = document.getElementById('corsProxyInput');

    const videoPreviewContainer = document.getElementById('videoPreviewContainer');

    // Default configuration
    let API_KEY = localStorage.getItem('socialsaver_api_key') || '';
    let API_HOST = localStorage.getItem('socialsaver_api_host') || 'social-media-video-downloader.p.rapidapi.com';
    let API_URL_BASE = localStorage.getItem('socialsaver_api_url') || 'https://social-media-video-downloader.p.rapidapi.com/smvd/get/all';
    let API_METHOD = localStorage.getItem('socialsaver_api_method') || 'GET';
    let USE_PROXY = localStorage.getItem('socialsaver_use_proxy') === 'true';

    // Show settings if no key is present on load (optional, maybe just let them click it)
    if (!API_KEY) {
        // console.log("No API Key found. User needs to set it.");
    }

    downloadBtn.addEventListener('click', handleDownload);

    // Allow pressing Enter to trigger download
    videoUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });

    // --- Input Actions ---
    clearBtn.addEventListener('click', () => {
        videoUrlInput.value = '';
        videoUrlInput.focus();
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            videoUrlInput.value = text;
            videoUrlInput.focus();
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            showMessage('No se pudo acceder al portapapeles. Por favor pega manualmente (Ctrl+V).', 'error');
        }
    });

    // --- Modal Logic ---

    // Result Modal
    closeResultModal.addEventListener('click', () => {
        resultModal.classList.add('hidden');
    });

    // Settings Modal
    settingsBtn.addEventListener('click', () => {
        apiKeyInput.value = API_KEY;
        apiHostInput.value = API_HOST;
        apiUrlInput.value = API_URL_BASE;
        apiMethodInput.value = API_METHOD;
        corsProxyInput.checked = USE_PROXY;
        settingsModal.classList.remove('hidden');
    });

    closeSettingsModal.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    saveSettingsBtn.addEventListener('click', () => {
        const newKey = apiKeyInput.value.trim();
        const newHost = apiHostInput.value.trim();
        const newUrl = apiUrlInput.value.trim();
        const newMethod = apiMethodInput.value;
        const newProxy = corsProxyInput.checked;

        if (newKey && newHost && newUrl) {
            API_KEY = newKey;
            API_HOST = newHost;
            API_URL_BASE = newUrl;
            API_METHOD = newMethod;
            USE_PROXY = newProxy;

            localStorage.setItem('socialsaver_api_key', API_KEY);
            localStorage.setItem('socialsaver_api_host', API_HOST);
            localStorage.setItem('socialsaver_api_url', API_URL_BASE);
            localStorage.setItem('socialsaver_api_method', API_METHOD);
            localStorage.setItem('socialsaver_use_proxy', USE_PROXY);

            settingsModal.classList.add('hidden');
            showMessage('¡Configuración guardada correctamente!', 'success');
            setTimeout(() => hideMessage(), 3000);
        } else {
            alert('Por favor, completa todos los campos.');
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            resultModal.classList.add('hidden');
        }
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    async function handleDownload() {
        const url = videoUrlInput.value.trim();

        if (!url) {
            showMessage('Por favor, ingresa una URL válida.', 'error');
            return;
        }

        if (!API_KEY) {
            showMessage('⚠️ Falta la API Key. Configúrala haciendo clic en el engranaje arriba a la derecha.', 'error');
            settingsModal.classList.remove('hidden');
            return;
        }

        setLoading(true);
        hideMessage();

        try {
            const data = await fetchVideoData(url);
            if (data) {
                showResult(data);
                showMessage('¡Video encontrado con éxito!', 'success');
            } else {
                showMessage('No se pudo encontrar el video. Verifica el enlace.', 'error');
            }
        } catch (error) {
            console.error(error);
            showMessage(`Error: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }

    async function fetchVideoData(videoUrl) {
        const options = {
            method: API_METHOD,
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': API_HOST
            }
        };

        let queryUrl;

        if (API_METHOD === 'POST') {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            options.body = new URLSearchParams({
                url: videoUrl
            });
            queryUrl = API_URL_BASE;
        } else {
            // GET (default)
            queryUrl = `${API_URL_BASE}?url=${encodeURIComponent(videoUrl)}`;
        }

        // If Proxy is enabled, wrap the URL
        if (USE_PROXY) {
            // Using corsproxy.io for demonstration. 
            // NOTE: Double encoding is sometimes needed or NOT needed depending on the proxy.
            // For corsproxy.io, usually just appending the full URL works.
            queryUrl = `https://corsproxy.io/?${encodeURIComponent(queryUrl)}`;
        }

        try {
            const response = await fetch(queryUrl, options);

            if (!response.ok) {
                let errorMsg = `Error status: ${response.status}`;
                try {
                    const errorBody = await response.text();
                    // Try to parse JSON if possible for cleaner message
                    try {
                        const errorJson = JSON.parse(errorBody);
                        errorMsg = errorJson.message || errorJson.error || errorBody;
                    } catch {
                        errorMsg = errorBody || errorMsg;
                    }
                } catch (e) {
                    // ignore reading error
                }

                if (response.status === 401 || response.status === 403) {
                    throw new Error(`Autorización fallida: ${errorMsg}`);
                }
                throw new Error(`Error del servidor (${response.status}): ${errorMsg}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            throw error;
        }
    }

    function showResult(data) {
        // NOTE: The structure of 'data' depends entirely on the API used.
        // We will assume a common structure usually returned by these APIs.
        // You may need to debug 'data' to see the actual fields: console.log(data);

        console.log('API Response:', data);

        // Mocking logic for demonstration if the API returns a certain structure
        // Adjust these fields based on your chosen API documentation
        let title = data.title || "Video descargado";
        let thumbnail = data.picture || data.thumbnail || "https://via.placeholder.com/640x360?text=No+Thumbnail";

        // Find the best quality link
        // Some APIs return 'links' array, others return 'url' directly
        let downloadUrl = null;

        if (data.medias && Array.isArray(data.medias)) {
            // Strategy for 'All-in-One' API structure
            // 1. Filter for videos (mp4)
            const videos = data.medias.filter(m => m.extension === 'mp4' || m.videoAvailable);

            if (videos.length > 0) {
                // 2. Sort by quality (simple heuristic: look for 'hd' or 'full hd')
                // We prefer 'full hd', then 'hd', then whatever.
                const bestVideo = videos.find(v => v.quality === 'full hd') ||
                    videos.find(v => v.quality === 'hd') ||
                    videos[0];
                downloadUrl = bestVideo.url;
            } else {
                // Maybe it's audio only?
                const audio = data.medias.find(m => m.extension === 'mp3');
                if (audio) downloadUrl = audio.url;
            }
        } else if (typeof data.links === 'object' && Array.isArray(data.links)) {
            // Example for other APIs: data.links = [{quality: 'hd', link: '...'}, {quality: 'sd', link: '...'}]
            downloadUrl = data.links[0]?.link;
        } else if (data.url && !data.medias) {
            // Only use data.url if we didn't find medias, AND ensure it's not just the source URL
            // (The generic API returns the source url in data.url, which we don't want to download)
            if (data.url.match(/\.(mp4|webm|mkv)$/)) {
                downloadUrl = data.url;
            }
        }

        // Fallback for demo purposes if we don't have a real API response during dev
        // REMOVE THIS BLOCK IN PRODUCTION if you strictly want real API results
        if (!downloadUrl && !API_KEY.includes('YOUR')) {
            // If we have a key but parsing failed, maybe just show what we got
            // But if we are in "No Key" mode (which we caught earlier), we won't reach here.
        }

        if (!downloadUrl) {
            // Try to find ANY url in the object
            // This is a fuzzy finder for various API formats
            const possibleUrl = JSON.stringify(data).match(/https?:\/\/[^"]+\.mp4/);
            if (possibleUrl) downloadUrl = possibleUrl[0];
        }

        if (!downloadUrl) {
            showMessage('No se pudo extraer el enlace de descarga del video.', 'error');
            return;
        }

        const html = `
            <div class="video-card">
                <div class="video-thumbnail">
                    <img src="${thumbnail}" alt="Thumbnail">
                </div>
                <div class="video-info">
                    <h3>${title}</h3>
                </div>
                <a href="${downloadUrl}" target="_blank" class="download-link" download>
                    <i class="fa-solid fa-download"></i> Descargar MP4
                </a>
                <p style="font-size: 0.8rem; color: #94a3b8; text-align: center; margin-top: 0.5rem;">
                    Si la descarga no inicia, haz clic derecho y elige "Guardar enlace como...".
                </p>
            </div>
        `;

        videoPreviewContainer.innerHTML = html;
        resultModal.classList.remove('hidden');
    }

    function setLoading(isLoading) {
        downloadBtn.disabled = isLoading;
        if (isLoading) {
            btnText.classList.add('hidden');
            btnIcon.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            btnText.classList.remove('hidden');
            btnIcon.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    }

    function showMessage(msg, type) {
        messageArea.textContent = msg;
        messageArea.className = 'message-area'; // reset
        messageArea.classList.add(type === 'error' ? 'message-error' : 'message-success');
        messageArea.classList.remove('hidden');
    }

    function hideMessage() {
        messageArea.classList.add('hidden');
    }
});
