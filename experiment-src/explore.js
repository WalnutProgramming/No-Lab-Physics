const images = ["orbit","ramp","balls","rectangle","random","smaller"]
const links = ["mQdfnRQREewP83u65edLM","j-D-D-MvwwQTxAw3TGQQG","-9zOyPV1pHbZ71xcN848d","QdGcISXXwSc3Mkinv39BB","kRAITlQnFRaAActkidJzg","eDeWVP4aDnf-KRnXBB34f"]
const sims = document.getElementsByClass("top-sims");

function testing(){
	for(let i = 0; i < images.length; i++){
		let a = document.createElement("a")
		let img = document.createElement("img")
		let p = document.createElement("p")

		a.href = ("https://no-lab-physics.netlify.app/experiment-create.html#" + links[i])

		img.src = ("./explore-img/" + images[i] + ".png")

		let node = document.createTextNode(images[i].charAt(0).toUpperCase() + images[i].slice(1))
		p.appendChild(node)
	
		a.appendChild(img)
		sims[i].appendChild(a)
		sims[i].appendChild(p)
	}
}
