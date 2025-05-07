const parametrosURL = new URLSearchParams(window.location.search);
const cedulaUsuario = parametrosURL.get('ci');
const idiomaActual = parametrosURL.get('lang') || 'es';

if (cedulaUsuario) {
    const rutaPerfil = `${cedulaUsuario}/perfil.json`;

    fetch(rutaPerfil)
        .then(respuesta => respuesta.json())
        .then(perfil => {
            const correo = perfil.email;

            document.title = perfil.nombre;
            document.getElementById('perfil-imagen').src = `${cedulaUsuario}/${perfil.imagen}`;
            document.getElementById('nombre').textContent = perfil.nombre;
            document.getElementById('descripcion').textContent = perfil.descripcion;
            document.getElementById('color').textContent = perfil.color;
            document.getElementById('libro').textContent = perfil.libro;
            document.getElementById('musica').textContent = perfil.musica;
            document.getElementById('video-juego').textContent = perfil.video_juego;

            const lenguajesElemento = document.getElementById('lenguajes');
            lenguajesElemento.textContent = perfil.lenguajes.join(', ');
            lenguajesElemento.innerHTML = perfil.lenguajes.map(lenguaje => `<strong>${lenguaje}</strong>`).join(', ');

            const enlaceEmail = document.getElementById('contacto-email');
            enlaceEmail.href = `mailto:${correo}`;
            enlaceEmail.textContent = correo;

            const rutaIdioma = `conf/config${idiomaActual.toUpperCase()}.json`;

            fetch(rutaIdioma)
                .then(respuesta => {
                    if (!respuesta.ok) {
                        throw new Error('Error en la carga del archivo de idioma.');
                    }
                    return respuesta.json();
                })
                .then(configuracion => {
                    const elementosTraducibles = document.querySelectorAll('[data-i18n]');

                    elementosTraducibles.forEach(elemento => {
                        const claveI18n = elemento.getAttribute('data-i18n');
                        const valorTraducido = configuracion[claveI18n];

                        if (valorTraducido) {
                            if (claveI18n === 'email') {
                                const partesTexto = valorTraducido.split('[email]');
                                const enlace = elemento.querySelector('#contacto-email');

                                if (enlace && partesTexto.length === 2) {
                                    elemento.innerHTML = `${partesTexto[0]}<a href="mailto:${correo}" id="contacto-email">${correo}</a>${partesTexto[1]}`;
                                }
                            } else {
                                elemento.textContent = valorTraducido;
                            }
                        }
                    });
                })
                .catch(error => {
                    console.error('Error cargando el archivo de idioma:', error);
                    alert("No se pudo cargar el archivo de idioma.");
                });

        })
        .catch(error => {
            console.error('Error cargando el perfil:', error);
            alert("No se pudo cargar el perfil. Verifique la cédula o el archivo.");
        });
} else {
    alert("No se proporcionó una cédula en la URL.");
}