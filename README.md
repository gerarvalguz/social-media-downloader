# SocialSaver - Descargador de Videos

Una aplicación web moderna y elegante para descargar videos de Facebook, Instagram y Twitter (X).

## 🚀 Características

- **Diseño Premium**: Interfaz limpia con animaciones suaves y modo oscuro por defecto.
- **Soporte Multiplataforma**: Preparado para Facebook, Instagram y Twitter.
- **Feedback Visual**: Indicadores de carga y mensajes de error claros.

## 🛠️ Configuración Necesaria

Esta aplicación es **Client-Side Only** (se ejecuta en tu navegador) y requiere conexión a una API externa para funcionar. Por defecto, está configurada para usar una estructura genérica de RapidAPI.

### Pasos para activar la descarga:

1. Ve a [RapidAPI Hub](https://rapidapi.com/hub).
2. Busca una API de "Social Media Video Downloader" (Ejemplos: *Social Downloader*, *All in One Downloader*). Muchas tienen planes gratuitos.
3. Suscríbete y obtén tu **API Key**.

4. Abre la aplicación `index.html` en tu navegador.
5. Haz clic en el ícono de **Configuración** ⚙️ (arriba a la derecha).
6. Pega tu API Key y guarda.
7. ¡Listo! Ya puedes descargar videos.

La clave se guarda localmente en tu navegador (LocalStorage), por lo que no necesitas editar código y persiste aunque cierres la página.

## 📦 Despliegue en GitHub Pages

Para publicar esta app en internet gratis usando GitHub Pages:

1. **Crea un repositorio en GitHub**:
   - Ve a [github.com/new](https://github.com/new).
   - Nómbralo como quieras (ej. `social-saver`).
   - No inicialices con README (ya tienes uno).

2. **Sube tu código**:
   Ejecuta estos comandos en tu terminal (dentro de la carpeta del proyecto):
   ```bash
   git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPO.git
   git branch -M main
   git push -u origin main
   ```

3. **Activa GitHub Pages**:
   - Ve a la pestaña **Settings** de tu repositorio en GitHub.
   - En el menú lateral, busca **Pages**.
   - En "Source", selecciona `Deploy from a branch`.
   - Elige la rama `main` y la carpeta `/ (root)`.
   - Haz clic en **Save**.

¡En unos minutos tu web estará visible en `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO`!

## ⚠️ Nota de Seguridad

Al usar la configuración por UI, tu API Key se guarda en **LocalStorage** de tu navegador.
- **Es seguro para uso personal**: La clave no se sube a GitHub ni se comparte con otros.
- **Producción**: Si quisieras ofrecer este servicio al público sin que ellos pongan su clave, necesitarías un backend.
