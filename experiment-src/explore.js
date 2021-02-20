const images = ["orbit","ramp","balls","tworect","random","smaller"]
const links = ["mQdfnRQREewP83u65edLM","j-D-D-MvwwQTxAw3TGQQG","-9zOyPV1pHbZ71xcN848d","QdGcISXXwSc3Mkinv39BB","kRAITlQnFRaAActkidJzg","eDeWVP4aDnf-KRnXBB34f"]
const sims = document.getElementsByClassName("top-sims");

function testing(){
	for(let i = 0; i < images.length; i++){
		let tag = document.createElement("a")
		let img = document.createElement("img")

		tag.href = ("https://no-lab-physics.netlify.app/experiment-create.html#" + links[i])

		img.src = ("./explore-img/" + images[i] + ".png")
		img.height = (sims[i].clientHeight);
		img.width = (sims[i].clientWidth);
	
		tag.appendChild(img)
		sims[i].appendChild(tag)
	}
}
