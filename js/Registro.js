document.getElementById("BTNRegistro").addEventListener("click", Registrar)

async function EnviarCorreo() {
    var Content = new FormData();
    Content.append("UserName", document.getElementById("TXTUsername").value);
    Content.append("Correo", document.getElementById("TXTCorreo").value);
    Content.append("Contraseña", document.getElementById("TXTContraseña").value);
    const Consulta = await fetch("php/Usuarios/Correo.php", { method: "GET" });
    const Respuesta = await Consulta.text();
}

var Estatus = [false, false]
function PasswordHS(Elemento, Numero) {
    if (!Estatus[Numero]) {
        document.getElementById(Elemento).type = "text";
        Estatus[Numero] = true;
    } else {
        document.getElementById(Elemento).type = "password";
        Estatus[Numero] = false;
    }
}
function PasswordMatch() {
    var C1 = document.getElementById("TXTContraseña").value;
    var C2 = document.getElementById("TXTContraseñaConf").value;
    if (C1 == C2) {
        return true;
    } else {
        document.getElementById("TXTContraseña").classList.add("is-invalid");
        document.getElementById("TXTContraseñaConf").classList.add("is-invalid");
        return false;
    }
}

async function ValidarUsuario() {
    var Content = new FormData();
    Content.append("UserName", document.getElementById("TXTUsername").value);
    const Consulta = await fetch("php/Usuarios/ValidarUsuario.php", { method: "POST", body: Content });
    const Respuesta = await Consulta.text();
    console.log(Respuesta)
    if (document.getElementById("TXTUsername").value != "") {
        {
            if (Respuesta == "true") {
                document.getElementById("TXTUsername").classList.add("is-valid");
                document.getElementById("TXTUsername").classList.remove("is-invalid");
                return true;
            } else {
                document.getElementById("TXTUsername").classList.add("is-invalid");
                document.getElementById("TXTUsername").classList.remove("is-valid");
                return false;
            }
        }

    } else {
        document.getElementById("TXTUsername").classList.add("is-invalid");
        document.getElementById("TXTUsername").classList.remove("is-valid");
        return false;
    }
}

function RegistroLleno() {
    var Incompleto = true;
    var Elementos = document.getElementsByClassName("RegisElement")
    for (var i = 0; i < Elementos.length; i++) {
        if (Elementos[i].value == "") {
            Incompleto = false;
            Elementos[i].classList.add("is-invalid");
        } else {
            Elementos[i].classList.remove("is-invalid");
        }
    }
    return Incompleto;
}

function ValidarCorreo() {
    var regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    if (regex.test(document.getElementById("TXTCorreo").value)) {
        document.getElementById("TXTCorreo").classList.remove("is-invalid");
        return true;
    } else {
        document.getElementById("TXTCorreo").classList.add("is-invalid");
        return false;
    }
}
function ValidarTelefono() {
    var regex = /^[0-9]{10}$/;
    if (regex.test(document.getElementById("TXTCelular").value)) {
        document.getElementById("TXTCelular").classList.remove("is-invalid");
        return true;
    } else {
        document.getElementById("TXTCelular").classList.add("is-invalid");
        return false;
    }
}


function CorregirCampo() {
    var Elementos = document.getElementsByClassName("RegisElement");
    console.log(Elementos)
}



async function ValidarElementos() {
    return ValidarUsuario().then((Respuesta) => {
        var Completo = true;
        if (RegistroLleno()) {
            if (!Respuesta) {
                Completo = false;
            }
            if (!ValidarCorreo()) {
                Completo = false;
            }
            if (!ValidarTelefono()) {
                Completo = false;
            }
            if (!PasswordMatch()) {
                Completo = false;
            }
            return Completo;

        } else {
            return false;
        }
    });

}

async function RegistrarCliente() {
    var Content = new FormData();
    Content.append("Nombre", document.getElementById("TXTNombre").value);
    Content.append("ApellidoP", document.getElementById("TXTApellidoP").value);
    Content.append("ApellidoM", document.getElementById("TXTApellidoM").value);
    Content.append("Correo", document.getElementById("TXTCorreo").value);
    Content.append("Celular", document.getElementById("TXTCelular").value);
    Content.append("UserName", document.getElementById("TXTUsername").value);
    Content.append("Contraseña", document.getElementById("TXTContraseña").value);
    const Consulta = await fetch("php/Usuarios/RegistrarCliente.php", { method: "POST", body: Content });
    const Respuesta = await Consulta.text();
    window.location.href = "index.html";
    LimpiarFormulario();
}

function Registrar() {
    const datos = ValidarElementos();
    datos.then((Respuesta) => {
        if (Respuesta) {
            alert("Registro Exitoso");
            RegistrarCliente()
        } else {
            alert("Registro Incompleto");
        }
    })
}
function LimpiarFormulario() {
    document.getElementById("TXTNombre").value = "";
    document.getElementById("TXTApellidoP").value = "";
    document.getElementById("TXTApellidoM").value = "";
    document.getElementById("TXTCorreo").value = "";
    document.getElementById("TXTCelular").value = "";
    document.getElementById("TXTUsername").value = "";
    document.getElementById("TXTContraseña").value = "";
    document.getElementById("TXTContraseñaConf").value = "";
}