function handleAnimation() {
    if (window.scrollY > 0) {
        document.querySelector("nav")?.classList.add("sticky");
    } else {
        document.querySelector("nav")?.classList.remove("sticky");
    }
}

if (window.innerWidth > 1024) {
    document.addEventListener("scroll", handleAnimation);
}

function hamburgerBtnHandler() {
    document.querySelector(".mobile-list")?.classList.toggle("hidden");
    document.querySelector(".bars")?.classList.toggle("clicked");
}

const btnn = document.querySelector(".btnn");
const reserver = document.querySelector(".reserver");
const alert = document.querySelector(".alert");
const error = document.querySelector(".error");
const close = document.querySelector(".close");
const errBtn = document.querySelector(".close.err");

btnn.addEventListener("click", () => {
    window.scrollTo({
        top: 0
    })
})

document.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
        btnn.classList.remove("asba");
    } else {
        btnn.classList.add("asba");
    }
})

const depart = document.querySelector(".orgg");
const destination = document.querySelector(".dess");
const telephone = document.querySelector(".tel");
const tarif = document.getElementById("tf");
const date = document.querySelector(".date-time");
const nom = document.querySelector(".nom");
const t = document.querySelector(".tarrif");
const email = document.querySelector(".te");
const ta = document.querySelector("#tmp");

function handleAdd() {
    t.value = tarif.value;
}

reserver.addEventListener("click", (e) => {
    e.preventDefault();

    const departt = "   " + depart.value + "   ";
    const destinationn = "   " + destination.value + "   ";
    const tariff = "   " + tarif.value + "   ";
    const datee = "   " + date.value + "   ";
    const nomm = "   " + nom.value + "   ";
    const emaill = "   " + email.value + "   ";
    const telephonee = "   " + telephone.value + "   ";

    if( depart.value === "" || destination.value === "" || tarif.value === "" || date.value === "" || nom.value === "" || email.value === "" || telephone.value === ""  ){
        const header = document.querySelector(".header.err");
        header.innerHTML = "tout les champs sont obligatoires";
        error.classList.remove("hiddenn");
        return;
    }

    if( validateEmail(email.value) === false ){
        const header = document.querySelector(".header.err");
        header.innerHTML = "adresse email non valide";
        error.classList.remove("hiddenn");
        return;
    }

    var templateParams = {
        message: JSON.stringify({
            depart: departt,
            destination: destinationn,
            tarif: tariff,
            date: datee,
            nom: nomm,
            email: emaill,
            telephone: telephonee
        })
    };

    emailjs.send('service_tk36szv', 'template_uowuyxl' , templateParams , 'unccAKBkfJ0PaZ5Gh')
        .then(function (response) {
            console.log('SUCCESS!', response.status, response.text);
            alert.classList.remove("hiddenn");

            depart.value = "";
            destination.value = "";
            tarif.value = "";
            date.value = "";
            nom.value = "";
            temps.value = "";
            telephone.value = "";


        }, function (error) {
            console.log('FAILED...', error);
        });
})

const interval = setInterval(() => {
    handleAdd();
}, 1000);


close.addEventListener("click", (e) => {
    alert.classList.add("hiddenn");
    error.classList.add("hiddenn");
})

errBtn.addEventListener("click", (e) => {
    alert.classList.add("hiddenn");
    error.classList.add("hiddenn");
})

function validateEmail(email) {
    const regex_pattern =      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if (regex_pattern.test(email)) {
        return true;
    }
    else {
        return false;
    }
}