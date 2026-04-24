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

// CREAR TAREA
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

    document.querySelector("#pendientes .tareas-container")
        .appendChild(tarea);

    actualizarContadores();
}

// ALERTAS DE FECHA
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

    if(diasRestantes === 1){
        return `<p class="alerta alerta-1">Último día disponible</p>`;
    }

    if(diasRestantes < 0){
        return `<p class="alerta alerta-vencida">Tarea vencida</p>`;
    }

    return "";
}

// EVENTOS
function agregarEventos(tarea, descripcion, prioridad, fecha){

    // mover a progreso
    tarea.querySelector(".btn-progreso").onclick = function(){
        document.querySelector("#progreso .tareas-container")
            .appendChild(tarea);

        actualizarContadores();
    };

    // mover a completadas
    tarea.querySelector(".btn-completar").onclick = function(){

        document.querySelector("#completadas .tareas-container")
            .appendChild(tarea);

        const botones = tarea.querySelector(".botones");

        botones.innerHTML = `
            <button class="btn-finalizar">Terminar</button>
        `;

        // ahora sí pasa al historial como completada
        tarea.querySelector(".btn-finalizar").onclick = function(){
            moverHistorialCompletada(
                tarea,
                descripcion,
                prioridad,
                fecha
            );
        };

        actualizarContadores();
    };

    // eliminar normal
    tarea.querySelector(".btn-eliminar").onclick = function(){
        moverHistorialEliminada(
            tarea,
            descripcion,
            prioridad,
            fecha
        );
    };
}

// HISTORIAL ELIMINADA
function moverHistorialEliminada(
    tarea,
    descripcion,
    prioridad,
    fecha
){
    tarea.remove();

    const historial = document.createElement("article");
    historial.classList.add(
        "tarea",
        "historial-eliminado"
    );

    historial.innerHTML = `
        <h4>${descripcion}</h4>
        <p><strong>Prioridad:</strong> ${prioridad}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Estado:</strong> Eliminada </p>

        <div class="botones">
            <button class="btn-reactivar">Reactivar</button>
            <button class="btn-borrar-definitivo">Borrar</button>
        </div>
    `;

    document.querySelector("#historial .tareas-container")
        .appendChild(historial);

    historial.querySelector(".btn-reactivar").onclick = function(){
        historial.remove();
        crearTarea(descripcion, prioridad, fecha);
        actualizarContadores();
    };

    historial.querySelector(".btn-borrar-definitivo").onclick = function(){
        historial.remove();
        actualizarContadores();
    };

    actualizarContadores();
}

// HISTORIAL COMPLETADA
function moverHistorialCompletada(
    tarea,
    descripcion,
    prioridad,
    fecha
){
    tarea.remove();

    const historial = document.createElement("article");
    historial.classList.add(
        "tarea",
        "historial-completado"
    );

    historial.innerHTML = `
        <h4>${descripcion}</h4>
        <p><strong>Prioridad:</strong> ${prioridad}</p>
        <p><strong>Fecha:</strong> ${fecha}</p>
        <p><strong>Estado:</strong> Completada </p>

        <div class="botones">
            <button class="btn-borrar-historial">Eliminar del historial</button>
        </div>
    `;

    document.querySelector("#historial .tareas-container")
        .appendChild(historial);

    historial.querySelector(".btn-borrar-historial").onclick = function(){
        historial.remove();
        actualizarContadores();
    };

    actualizarContadores();
}

// CONTADORES
function actualizarContadores(){
    document.querySelectorAll(".columna").forEach(columna=>{
        const total = columna.querySelectorAll(".tarea").length;
        columna.querySelector(".contador").textContent = total;
    });
}