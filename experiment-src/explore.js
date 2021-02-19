const images = ["./explore-img/balls.png","./explore-img/multiple.png","./explore-img/orbit.png","./explore-img/ramp.png","./explore-img/random.png","./explore-img/smaller.png"]
const links = ["#sGsiVpiBNNUruWH4JifR2", "#mLI52rAtYpvBxSDhaxGoe", "l#AM4noTHlCQ3ja3UQ_X2GQ", "#8Mxh5fXQboFNyVEI8Sf2r", "#yQXvv_togO9L9smlO0-U2", "#53ATFufNSLGWwew4OUd-F"]
const sims = document.getElementsByClassName("top-sims");

// var para = document.createElement("p");
// var node = document.createTextNode("This is new.");
// para.appendChild(node);

// var element = document.getElementById("div1");
// element.appendChild(para);

function testing(){
	for(let i = 0; i < images.length; i++){
		let tag = document.createElement("a")
		let img = document.createElement("img")

		tag.href = ("https://no-lab-physics.netlify.app/experiment-create.html" + links[i])

		img.src = images[i]
		img.height = (sims[i].clientHeight);
		img.width = (sims[i].clientWidth);
	
		tag.appendChild(img)
		sims[i].appendChild(tag)
	}
}
