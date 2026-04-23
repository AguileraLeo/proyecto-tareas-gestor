const formulario = document.getElementById("taskForm");

formulario.addEventListener("submit", function(e){
    e.preventDefault();

    const descripcion = document.getElementById("descripcion").value;
    const prioridad = document.getElementById("prioridad").value;
    const fecha = document.getElementById("fecha").value;

    if(descripcion === "" || prioridad === "" || fecha === ""){
        alert("Complete todos los campos");
        return;
    }

    crearTarea(descripcion, prioridad, fecha);
    formulario.reset();
});

function crearTarea(descripcion, prioridad, fecha){

    const tarea = document.createElement("article");
    tarea.classList.add("tarea");

    if(prioridad === "alta"){
        tarea.classList.add("prioridad-alta");
    } 
    else if(prioridad === "media"){
        tarea.classList.add("prioridad-media");
    } 
    else{
        tarea.classList.add("prioridad-baja");
    }

    const alertaFecha = generarAvisoFecha(fecha);

    tarea.innerHTML = `
        <h4>${descripcion}</h4>
        <p><strong>Prioridad:</strong> ${prioridad}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        ${alertaFecha}

        <div class="botones">
            <button class="btn-progreso">Mover a Progreso</button>
            <button class="btn-completar">Completar</button>
            <button class="btn-eliminar">Eliminar</button>
        </div>
    `;

    agregarEventos(tarea, descripcion, prioridad, fecha);

    document.querySelector("#pendientes .tareas-container").appendChild(tarea);

    actualizarContadores();
}

function generarAvisoFecha(fecha){

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const partes = fecha.split("-");
    const fechaLimite = new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
    );

    fechaLimite.setHours(0,0,0,0);

    const diferencia = fechaLimite - hoy;
    const diasRestantes = Math.floor(
        diferencia / (1000 * 60 * 60 * 24)
    );

    if(diasRestantes === 0){
        return `<p class="alerta alerta-hoy">ENTREGA HOY</p>`;
    }

    if(diasRestantes === 3){
        return `<p class="alerta alerta-3">Faltan 3 días</p>`;
    }

    if(diasRestantes === 2){
        return `<p class="alerta alerta-2">Faltan 2 días</p>`;
    }

    if(diasRestantes === 1){
        return `<p class="alerta alerta-1">Último día disponible</p>`;
    }

    if(diasRestantes < 0){
        return `<p class="alerta alerta-vencida">Tarea vencida</p>`;
    }

    return "";
}

function agregarEventos(tarea, descripcion, prioridad, fecha){

    tarea.querySelector(".btn-progreso").onclick = function(){
        document.querySelector("#progreso .tareas-container").appendChild(tarea);
        actualizarContadores();
    };

    tarea.querySelector(".btn-completar").onclick = function(){

        document.querySelector("#completadas .tareas-container").appendChild(tarea);

        const botones = tarea.querySelector(".botones");

        botones.innerHTML = `
            <button class="btn-eliminar">Eliminar</button>
        `;

        tarea.querySelector(".btn-eliminar").onclick = function(){
            moverHistorial(tarea, descripcion, prioridad, fecha);
        };

        actualizarContadores();
    };

    tarea.querySelector(".btn-eliminar").onclick = function(){
        moverHistorial(tarea, descripcion, prioridad, fecha);
    };
}

function moverHistorial(tarea, descripcion, prioridad, fecha){

    tarea.remove();

    const historial = document.createElement("article");
    historial.classList.add("tarea");
    historial.classList.add("historial-eliminado");

    historial.innerHTML = `
        <h4>${descripcion}</h4>
        <p><strong>Prioridad:</strong> ${prioridad}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Estado:</strong> Eliminada</p>

        <div class="botones">
            <button class="btn-reactivar">Reactivar</button>
            <button class="btn-borrar-definitivo">Borrar</button>
        </div>
    `;

    document.querySelector("#historial .tareas-container").appendChild(historial);

    historial.querySelector(".btn-reactivar").onclick = function(){
        historial.remove();
        crearTareaReactiva(descripcion, prioridad, fecha);
        actualizarContadores();
    };

    historial.querySelector(".btn-borrar-definitivo").onclick = function(){
        historial.remove();
        actualizarContadores();
    };

    actualizarContadores();
}

function crearTareaReactiva(descripcion, prioridad, fecha){
    crearTarea(descripcion, prioridad, fecha);
    document.querySelector("#progreso .tareas-container")
        .appendChild(document.querySelector("#pendientes .tarea:last-child"));
}

function actualizarContadores(){
    document.querySelectorAll(".columna").forEach(columna=>{
        const total = columna.querySelectorAll(".tarea").length;
        columna.querySelector(".contador").textContent = total;
    });
}