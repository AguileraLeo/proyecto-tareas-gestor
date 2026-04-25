const taskForm = document.getElementById("taskForm");
const descripcion = document.getElementById("descripcion");
const prioridad = document.getElementById("prioridad");
const fecha = document.getElementById("fecha");

const materiaSelect = document.getElementById("materiaSelect");
const materiaRapida = document.getElementById("materiaRapida");

const nuevaMateria = document.getElementById("nuevaMateria");
const agregarMateriaBtn = document.getElementById("agregarMateriaBtn");
const filtroMateria = document.getElementById("filtroMateria");

let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
let materias = JSON.parse(localStorage.getItem("materias")) || [];


tareas = tareas.map(t => ({
    historialTipo: null,
    ...t
}));


function cargarMaterias(){
    materiaSelect.innerHTML = `<option value="">Seleccionar</option>`;
    filtroMateria.innerHTML = `<option value="todas">Todas</option>`;

    materias.forEach(materia=>{
        materiaSelect.innerHTML += `
            <option value="${materia}">
                ${materia}
            </option>
        `;

        filtroMateria.innerHTML += `
            <option value="${materia}">
                ${materia}
            </option>
        `;
    });
}


agregarMateriaBtn.addEventListener("click",()=>{
    const nombre = nuevaMateria.value.trim();

    if(nombre==="" || materias.includes(nombre)){
        alert("Materia inválida o ya existente");
        return;
    }

    materias.push(nombre);

    localStorage.setItem(
        "materias",
        JSON.stringify(materias)
    );

    nuevaMateria.value="";
    cargarMaterias();
});


taskForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    let materiaFinal = materiaSelect.value;

    if(materiaRapida.value.trim()!==""){
        materiaFinal = materiaRapida.value.trim();

        if(!materias.includes(materiaFinal)){
            materias.push(materiaFinal);

            localStorage.setItem(
                "materias",
                JSON.stringify(materias)
            );

            cargarMaterias();
        }
    }

    if(
        descripcion.value==="" ||
        prioridad.value==="" ||
        fecha.value==="" ||
        materiaFinal===""
    ){
        alert("Complete todos los campos");
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        descripcion: descripcion.value,
        materia: materiaFinal,
        prioridad: prioridad.value,
        fecha: fecha.value,
        estado: "pendiente",
        historialTipo: null
    };

    tareas.push(nuevaTarea);

    guardarDatos();

    taskForm.reset();
    renderizarTareas();
});


function guardarDatos(){
    localStorage.setItem(
        "tareas",
        JSON.stringify(tareas)
    );
}


function renderizarTareas(){

    document.querySelectorAll(".tareas-container").forEach(c=>{
        c.innerHTML="";
    });

    const filtro = filtroMateria.value;

    tareas.forEach(tarea=>{

        if(
            filtro!=="todas" &&
            tarea.materia!==filtro
        ){
            return;
        }

        let contenedor;

        if(tarea.estado==="pendiente"){
            contenedor=document.querySelector("#pendientes .tareas-container");
        }
        else if(tarea.estado==="progreso"){
            contenedor=document.querySelector("#progreso .tareas-container");
        }
        else if(tarea.estado==="completada"){
            contenedor=document.querySelector("#completadas .tareas-container");
        }
        else{
            contenedor=document.querySelector("#historial .tareas-container");
        }

        const div=document.createElement("div");
        div.classList.add("tarea");

        if(tarea.estado==="historial"){
            if(tarea.historialTipo==="completada"){
                div.classList.add("historial-completada");
            }

            if(tarea.historialTipo==="eliminada"){
                div.classList.add("historial-eliminada");
            }
        }

        let alerta = generarAlertaFecha(tarea.fecha);

        div.innerHTML=`
            <h4>${tarea.descripcion}</h4>
            <p><strong>Materia:</strong> ${tarea.materia}</p>
            <p class="${tarea.prioridad}">
                <strong>Prioridad:</strong> ${tarea.prioridad}
            </p>
            <p><strong>Fecha:</strong> ${tarea.fecha}</p>
            ${alerta}
        `;


        if(tarea.estado==="pendiente"){
            div.innerHTML += `
                <button onclick="cambiarEstado(${tarea.id},'progreso')">
                    Progreso
                </button>

                <button onclick="moverHistorialEliminada(${tarea.id})">
                    Eliminar
                </button>
            `;
        }

        if(tarea.estado==="progreso"){
            div.innerHTML += `
                <button onclick="cambiarEstado(${tarea.id},'completada')">
                    Completar
                </button>
            `;
        }

        if(tarea.estado==="completada"){
            div.innerHTML += `
                <button onclick="moverHistorialCompletada(${tarea.id})">
                    Historial
                </button>
            `;
        }

        if(tarea.estado==="historial"){
            div.innerHTML += `
                <button onclick="cambiarEstado(${tarea.id},'pendiente')">
                    Reactivar
                </button>

                <button class="btn-delete"
                    onclick="eliminarDefinitivamente(${tarea.id})">
                    ✖
                </button>
            `;
        }

        contenedor.appendChild(div);
    });

    actualizarStats();
    actualizarContadores();
}


function generarAlertaFecha(fechaEntrega){

    // evitar error de zona horaria
    const partes = fechaEntrega.split("-");

    const fecha = new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
    );

    const hoy = new Date();

    hoy.setHours(0,0,0,0);
    fecha.setHours(0,0,0,0);

    const diferencia = Math.round(
        (fecha - hoy) / (1000 * 60 * 60 * 24)
    );

    if(diferencia < 0){
        return `
            <p style="color:#dc2626;">
                 TAREA VENCIDA
            </p>
        `;
    }

    if(diferencia === 0){
        return `
            <p style="color:red;">
                 ENTREGA HOY
            </p>
        `;
    }

    if(diferencia <= 3){
        return `
            <p style="color:orange;">
                 Faltan ${diferencia} día(s)
            </p>
        `;
    }

    if(diferencia <= 7){
        return `
            <p style="color:#2563eb;">
                 Se acerca la entrega
            </p>
        `;
    }

    return "";
}


function cambiarEstado(id,nuevoEstado){
    tareas=tareas.map(t=>{
        if(t.id===id){
            t.estado=nuevoEstado;
        }
        return t;
    });

    guardarDatos();
    renderizarTareas();
}

function moverHistorialCompletada(id){
    tareas=tareas.map(t=>{
        if(t.id===id){
            t.estado="historial";
            t.historialTipo="completada";
        }
        return t;
    });

    guardarDatos();
    renderizarTareas();
}

function moverHistorialEliminada(id){
    tareas=tareas.map(t=>{
        if(t.id===id){
            t.estado="historial";
            t.historialTipo="eliminada";
        }
        return t;
    });

    guardarDatos();
    renderizarTareas();
}


function eliminarDefinitivamente(id){

    const confirmar = confirm(
        "¿Eliminar esta tarea permanentemente?"
    );

    if(!confirmar){
        return;
    }

    tareas = tareas.filter(t => {
        return String(t.id) !== String(id);
    });

    guardarDatos();

    renderizarTareas();
}
function actualizarStats(){

    const hoy = new Date().toISOString().split("T")[0];

    document.getElementById("totalTareas").textContent =
        tareas.length;

    document.getElementById("pendientesCount").textContent =
        tareas.filter(t=>t.estado==="pendiente").length;

    document.getElementById("completadasCount").textContent =
        tareas.filter(t=>t.estado==="completada").length;

    document.getElementById("entregasHoyCount").textContent =
        tareas.filter(t=>t.fecha===hoy).length;
}

function actualizarContadores(){
    document.querySelector("#pendientes .contador").textContent=
        tareas.filter(t=>t.estado==="pendiente").length;

    document.querySelector("#progreso .contador").textContent=
        tareas.filter(t=>t.estado==="progreso").length;

    document.querySelector("#completadas .contador").textContent=
        tareas.filter(t=>t.estado==="completada").length;

    document.querySelector("#historial .contador").textContent=
        tareas.filter(t=>t.estado==="historial").length;
}


filtroMateria.addEventListener(
    "change",
    renderizarTareas
);


cargarMaterias();
renderizarTareas();