import sys
import os
from pathlib import Path

if sys.argv[1:]:
    sys.path.insert(0, f"{Path.home()}{os.sep}{sys.argv[1]}")

sys.path.insert(0, f"{Path.home()}{os.sep}pylib")

from flask import Flask, Blueprint, render_template, request

from logging.config import dictConfig
from urllib.parse import urlparse
from manager.container import Container

from urllib.parse import urlparse

views = Blueprint('views', __name__, template_folder='templates')

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://flask.logging.wsgi_errors_stream',
        'formatter': 'default'
    }},
    'root': {
        'level': 'INFO',
        'handlers': ['wsgi']
    }
})

JSON_COLUMN_FAMILY = "json"
TEXT_COLUMN_FAMILY = "text"

app = Flask(__name__)

app.register_blueprint(views)

@app.route("/status", methods=["GET"])
def get_status():

    return command.status(
    {
            "datalake_url": request.headers.get('datalake-url'),
            "datalake_namespace": request.headers.get('datalake-namespace'),
            "datalake_userid": request.headers.get('datalake-userid'),
            "datalake_password": request.headers.get('datalake-password'), 
            "datalake_table": request.headers.get('datalake-table')
    })

@app.route("/search", methods=["GET"])
def get_search():

    return command.search(
    {
        "datalake_url": request.headers.get('datalake-url'),
        "datalake_namespace": request.headers.get('datalake-namespace'),
        "datalake_userid": request.headers.get('datalake-userid'),
        "datalake_password": request.headers.get('datalake-password'),
        "datalake_table": request.headers.get('datalake-table'),
        "row_filter": request.values.get('filter', '*').strip(),
        "row_limit": request.values.get('limit', '10')
    })
    
@app.route("/")
def start():
    app.logger.info('Returning main screen')

    return render_template("index.html")

if __name__ == "__main__":
    container = Container()

    storage = container.storage()
    command = container.command()

    storage.set_logger(app.logger)
    command.set_logger(app.logger)

    app.logger.info("[main] Audit Monitor - started...")
   
    port = 8080

    if sys.argv[1:] and len(sys.argv[1:]) >= 2:
        port = sys.argv[2]

    app.run(host='0.0.0.0', port=port)
