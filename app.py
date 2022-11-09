#!/bin/python3
import flask, flask_login
from flask_login import current_user
import json
from datetime import datetime
from base import app,load_info,ajax,DBDict

# -- Info for every Hack-A-Day project --
load_info({
    "project_name": "Hack-A-Mandelbrot",
    "source_url": "https://github.com/za3k/day09_mandelbrot",
    "subdir": "/hackaday/mandelbrot",
    "description": "a mandelbrot set browser. Click to zoom. Browser forward and back work fine",
    "login": False,
})

# -- Routes specific to this Hack-A-Day project --
@app.route("/")
def index():
    return flask.render_template('index.html')
