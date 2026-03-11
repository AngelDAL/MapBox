async function ComprobarSesion() {
    var Content = new FormData();
    Content.append("usuario", document.getElementById("usuario").value);
    Content.append("contraseña", document.getElementById("contraseña").value);
    const response = await fetch("php/Usuarios/ConfSes.php", { method: "POST", body: Content });
    const respuesta = await response.text();
    //console.log(respuesta);;
    var datos = respuesta.split("|");
    console.log(datos)
    if (datos[0] != "" && datos[2] != "") {
        //Guardar sesion en local storage
        localStorage.setItem("TokenIS", datos[1]);
        localStorage.setItem("UserIS", datos[2]);
        window.location.href = "index.html";
    }
    else {
        alert("Sesion Invalida");
    }
}