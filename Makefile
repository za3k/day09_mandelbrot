run-debug:
	flask --debug run
run-demo:
	gunicorn3 -e SCRIPT_NAME=/hackaday/mandelbrot --bind 0.0.0.0:8009 app:app
