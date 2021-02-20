// NProgress Bar

if (!window.isFinishedLoading) {
	import(
		"https://cdn.skypack.dev/pin/nprogress@v0.2.0-RdPXHoq1oeOslzh9Iunf/mode=imports,min/optimized/nprogress.js"
	).then((NProgress) => {
		NProgress.configure({ parent: "main" });
		setTimeout(() => {
			if (!window.isFinishedLoading) {
				NProgress.start();
				window.NProgress = NProgress;
			}
		}, 200);
	});
}
