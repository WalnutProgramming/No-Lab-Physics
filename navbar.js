class PhysicsNavbar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.innerHTML = /* HTML */ `
			<nav>
				<li>
					<ul>
						<a href="/">Home</a>
					</ul>
					<ul>
						<a href="/about.html">About</a>
					</ul>
					<ul>
						<a href="/explore.html">Explore Simulations</a>
					</ul>
					<ul>
						<a href="/feedback.html">Feedback</a>
					</ul>
				</li>
			</nav>

			<!-- styles are scoped to the navbar -->
			<style>
				nav {
					background-color: rgb(119, 119, 240);
				}

				li {
					display: flex;
					justify-content: center;
				}

				ul {
					padding: 0 1rem;
				}

				ul a {
					color: white;
					font-size: 1.5rem;
					text-decoration: none;
				}

				ul a:hover {
					color: #ccc;
				}

				@media only screen and (max-width: 768px) {
					ul a {
						color: white;
						font-size: 0.85rem;
						text-decoration: none;
					}	
				}
			</style>
		`;
	}
}

customElements.define("physics-navbar", PhysicsNavbar);
