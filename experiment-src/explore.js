const images = ["./explore-img/balls.png","./explore-img/multiple.png","./explore-img/orbit.png","./explore-img/ramp.png","./explore-img/random.png","./explore-img/smaller.png"]
const sims = document.getElementsByClassName("top-sims");
const img = document.getElementsByClassName("sim-preview");

function testing(){
	for(let i = 0; i < 6; i++){
		img[i].src = images[i]
		img[i].height = (sims[i].clientHeight);
		img[i].width = (sims[i].clientWidth);
	}
}
