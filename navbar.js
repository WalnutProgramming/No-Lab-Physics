class PhysicsNavbar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = /* HTML */ `
			<nav>
				<ul>
					<li>
						<a href="/">Home</a>
					</li>
					<li>
						<a href="/experiment-create.html">Create</a>
					</li>
					<li>
						<a href="/explore.html">Explore</a>
					</li>
					<li>
						<a href="/about.html">About</a>
					</li>
					<li>
						<a href="/feedback.html">Feedback</a>
					</li>
				</ul>
			</nav>

			<!-- styles are scoped to the navbar -->
			<style>
				nav {
					background-color: rgb(119, 119, 240);
				}

				ul {
					display: flex;
					justify-content: center;
					list-style: none;
					margin: 0;
					padding: 0;
				}

				li {
					/* padding: 1rem 1rem; */
				}

				li a {
					color: white;
					font-size: 1.5rem;
					text-decoration: none;
					font-family: 'Comfortaa', cursive;
					display: block;
					padding: 1rem 1rem;
				}

				li a:hover {
					background-color: rgb(107, 107, 227);
				}

				@media only screen and (max-width: 768px) {
					li a {
						color: white;
						font-size: 0.70rem;
						text-decoration: none;
					}	
				}

				@media only screen and (max-width: 370px) {
					li {
						padding: 0 0.3rem;
					}
				}
			</style>
		`;
	}
}

customElements.define("physics-navbar", PhysicsNavbar);
