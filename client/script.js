import bot from './assets/bot.svg'
import usuario from './assets/usuario.svg'

// Cargar variables de entorno
const API_URL = import.meta.env.VITE_BACKEND_URL

const formulario = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let intervaloCarga

function loader(elemento) {
    elemento.textContent = ''

    intervaloCarga = setInterval(() => {
        // Actualizar el contenido de texto del indicador de carga
        elemento.textContent += '.';

        // Si el indicador de carga ha alcanzado los tres puntos, reiniciarlo
        if (elemento.textContent === '....') {
            elemento.textContent = '';
        }
    }, 300);
}

function typeText(elemento, texto) {
    let i = 0

    let interval = setInterval(() => {
        if (i < texto.length) {
            elemento.innerHTML += texto.charAt(i)
            i++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generar ID único para cada mensaje div de bot
// necesario para escribir el efecto de texto para esa respuesta específica
// sin ID único, escribir texto funcionará en todos los elementos
function generateUniqueId() {
    const tiempo = Date.now();
    const numeroRandom = Math.random();
    const stringHexadecimal = numeroRandom.toString(16);

    return `id-${tiempo}-${stringHexadecimal}`;
}

function chatStripe(esIA, valor, id) {
    return (
        `
        <div class="comentario ${esIA && 'ia'}">
            <div class="chat">
                <div class="perfil">
                    <img 
                      src=${esIA ? bot : usuario} 
                      alt="${esIA ? 'bot' : 'usuario'}" 
                    />
                </div>
                <div class="mensaje" id=${id}>${valor}</div>
            </div>
        </div>
    `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(formulario)

    // comentario del usuario
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // borrar la entrada del área de texto 
    formulario.reset()

    // comentario del bot
    const id = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", id)

    // enfocar desplazarse hacia abajo
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // div mensaje específico 
    const mensajeDiv = document.getElementById(id)

    // mensajeDiv.innerHTML = "..."
    loader(mensajeDiv)

    const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(intervaloCarga)
    mensajeDiv.innerHTML = " "

    if (respuesta.ok) {
        const data = await respuesta.json();
        const dataAnalizada = data.bot.trim() //recorta los espacios finales/'\n'

        typeText(mensajeDiv, dataAnalizada)
    } else {
        const error = await respuesta.text()

        mensajeDiv.innerHTML = "Algo salió mal"
        alert(error)
    }
}

formulario.addEventListener('submit', handleSubmit)
formulario.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})