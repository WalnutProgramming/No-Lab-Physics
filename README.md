# Physics-Engine-P5
Walnut Hills Programming Club's 2021 showcase project. No Lab Physics allows students and teachers to create their own custom physics labs. 

Pepo Try it here: <https://no-lab-physics.netlify.app/>.

## Running the project
You can use repl.it, or you can run it locally.

Running the project locally: Unfortunately ES modules aren't allowed over files, so you have to set up a simple HTTP file server. Here are a few options for starting a local file server.

- VSCode has an extension called Live Server that you can use for this. (suggestion by Louis)
- You can run `python -m http.server 8000` if you have Python 3 installed (or `python -m SimpleHTTPServer 8000` on Python 2).
- You can run `npx serve` if you have npm installed.

Running it locally or on repl.it will mean that the serverless functions for generating short URLs won't work, but that doesn't really matter because it'll fall back to generating long URLs.

## Contributing
Pull requests are welcome from those in the club. Make sure to open a issue first for larger contributions so we can discuss those large changes and make sure we get them right before we crash our main branch.
