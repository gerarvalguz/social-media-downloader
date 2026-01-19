document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const btnText = downloadBtn.querySelector('.btn-text');
    const btnIcon = downloadBtn.querySelector('.btn-icon');
    const spinner = downloadBtn.querySelector('.spinner');
    const messageArea = document.getElementById('messageArea');
    const resultModal = document.getElementById('resultModal');
    const closeModal = document.querySelector('.close-modal');
    const videoPreviewContainer = document.getElementById('videoPreviewContainer');

    // CONFIGURATION - IMPORTANT FOR THE USER
    // To make this app work, you need an API Key.
    // We are simulating the "Social Downloader API" often found on RapidAPI.
    // Steps to get a key:
    // 1. Go to RapidAPI (e.g., https://rapidapi.com/hub)
    // 2. Search for "Social Media Video Downloader"
    // 3. Subscribe to a free tier
    // 4. Paste your API Key below

    const API_KEY = 'YOUR_RAPIDAPI_KEY_HERE'; // <--- PASTE YOUR KEY HERE
    const API_HOST = 'social-media-video-downloader.p.rapidapi.com'; // Example Host
    const API_URL = 'https://social-media-video-downloader.p.rapidapi.com/smvd/get/all';

    downloadBtn.addEventListener('click', handleDownload);

    // Allow pressing Enter to trigger download
    videoUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleDownload();
        }
    });

    closeModal.addEventListener('click', () => {
        resultModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            resultModal.classList.add('hidden');
        }
    });

    async function handleDownload() {
        const url = videoUrlInput.value.trim();

        if (!url) {
            showMessage('Por favor, ingresa una URL válida.', 'error');
            return;
        }

        if (API_KEY === 'YOUR_RAPIDAPI_KEY_HERE') {
            showMessage('⚠️ Falta la API Key. Por favor configura el archivo script.js (línea 16).', 'error');
            console.warn('User needs to set the API Key in script.js');
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
            showMessage('Ocurrió un error al procesar tu solicitud.', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function fetchVideoData(videoUrl) {
        // This is a generic implementation for a RapidAPI service.
        // You might need to adjust the headers or response parsing depending on the specific API you choose.

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': API_HOST
            }
        };

        // Note: Many APIs accept the URL as a query parameter
        // Example: ?url=...
        // We are encoding the URL component to ensure safeness
        const queryUrl = `${API_URL}?url=${encodeURIComponent(videoUrl)}`;

        try {
            const response = await fetch(queryUrl, options);

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Error de autorización. Verifica tu API Key.');
                }
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const result = await response.json();
            return result; // Return the raw JSON to parse in showResult
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

        if (typeof data.links === 'object' && Array.isArray(data.links)) {
            // Example: data.links = [{quality: 'hd', link: '...'}, {quality: 'sd', link: '...'}]
            downloadUrl = data.links[0]?.link;
        } else if (data.url) {
            downloadUrl = data.url;
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
