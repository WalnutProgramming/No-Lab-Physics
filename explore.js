const images = ["orbit", "ramp", "balls", "tworect", "random", "smaller"];
const links = [
	"mQdfnRQREewP83u65edLM",
	"j-D-D-MvwwQTxAw3TGQQG",
	"-9zOyPV1pHbZ71xcN848d",
	"QdGcISXXwSc3Mkinv39BB",
	"kRAITlQnFRaAActkidJzg",
	"eDeWVP4aDnf-KRnXBB34f",
];
const sims = document.getElementById("sims");

for (let i = 0; i < images.length; i++) {
	let img = document.createElement("img");
	img.src = "./explore-img/" + images[i] + ".png";

	let a = document.createElement("a");
	a.href =
		"https://no-lab-physics.netlify.app/experiment-create.html#" + links[i];
	a.appendChild(img);

	let p = document.createElement("p")
	let node = document.createTextNode(images[i].charAt(0).toUpperCase() + images[i].slice(1))
	p.appendChild(node)

	a.appendChild(p)
	sims.appendChild(a);
}