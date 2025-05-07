document.addEventListener("DOMContentLoaded", () => {
    const listaPerfiles = document.querySelector(".estudiante-list");
    const parametrosURL = new URLSearchParams(window.location.search);
    const idiomaSeleccionado = parametrosURL.get("lang") || "es";
    const mensajeSinResultados = document.getElementById('no-results-message');

    let listaDatosPerfiles = [];

    const renderizarPerfiles = (perfiles) => {
        listaPerfiles.innerHTML = "";
        perfiles.forEach(perfil => {
            const elementoLista = document.createElement("li");
            elementoLista.className = "estudiante-item";

            const enlacePerfil = document.createElement("a");
            enlacePerfil.href = `perfil.html?ci=${perfil.ci}&lang=${idiomaSeleccionado}`;

            const imagen = document.createElement("img");
            imagen.src = perfil.imagen;
            imagen.alt = perfil.nombre;

            const tituloNombre = document.createElement("div");
            tituloNombre.textContent = perfil.nombre;

            enlacePerfil.appendChild(imagen);
            enlacePerfil.appendChild(tituloNombre);
            elementoLista.appendChild(enlacePerfil);
            listaPerfiles.appendChild(elementoLista);
        });
    };

    fetch("datos/index.json")
        .then(respuesta => {
            if (!respuesta.ok) throw new Error("No se pudo cargar el archivo de perfiles.");
            return respuesta.json();
        })
        .then(datos => {
            listaDatosPerfiles = datos;
            renderizarPerfiles(listaDatosPerfiles);
        })
        .catch(error => {
            console.error("Error cargando los perfiles:", error);
            mensajeSinResultados.textContent = "No se pudieron cargar los perfiles.";
            mensajeSinResultados.style.display = 'block';
        });

    fetch(`conf/config${idiomaSeleccionado.toUpperCase()}.json`)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error("No se pudo cargar el archivo de idioma.");
            return respuesta.json();
        })
        .then(config => {
            const elementosParaTraducir = document.querySelectorAll('[data-i18n], [data-i18n-placeholder]');

            elementosParaTraducir.forEach(elemento => {
                const clave = elemento.getAttribute('data-i18n') || elemento.getAttribute('data-i18n-placeholder');

                if (clave && config[clave]) {
                    if (elemento.hasAttribute('data-i18n-placeholder')) {
                        elemento.setAttribute('placeholder', `${config[clave]}...`);
                    } else if (elemento.tagName === 'BUTTON' && clave === 'buscar') {
                        elemento.textContent = config[clave];
                    } else if (Array.isArray(config[clave])) {
                        if (clave === "sitio") {
                            const [parte1, parte2, parte3] = config[clave];
                            document.title = `${parte1} ${parte2} ${parte3}`;
                            elemento.innerHTML = `${parte1}<span>${parte2}</span> ${parte3}`;
                        } else {
                            elemento.textContent = config[clave].join(' ');
                        }
                    } else if (clave === 'saludo') {
                        const nombreUsuario = elemento.querySelector('#nombre-usuario');
                        const nombre = nombreUsuario ? nombreUsuario.textContent : '';
                        elemento.textContent = `${config[clave]}, ${nombre}`;
                    } else {
                        elemento.textContent = config[clave];
                    }
                }
            });

            const formularioBusqueda = document.querySelector('form');
            const campoBusqueda = document.querySelector('input[name="query"]');

            formularioBusqueda.addEventListener('submit', (evento) => {
                evento.preventDefault();
                const termino = campoBusqueda.value.trim().toLowerCase();
                filtrarPerfiles(termino, config);
            });

            const filtrarPerfiles = (termino, config) => {
                const resultados = listaDatosPerfiles.filter(perfil =>
                    perfil.nombre.toLowerCase().includes(termino)
                );

                if (resultados.length === 0) {
                    mensajeSinResultados.textContent = config.no_results.replace('[query]', termino);
                    mensajeSinResultados.style.display = 'block';
                } else {
                    mensajeSinResultados.style.display = 'none';
                }

                renderizarPerfiles(resultados);
            };
        })
        .catch(error => {
            console.error("Error cargando el archivo de idioma:", error);
            alert("No se pudo cargar el archivo de idioma.");
        });
});
