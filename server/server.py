from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)
API_KEY = "5167S634GJGKUS2AQDSCCV1FYXKVYR6XPQ"
url = "https://api.etherscan.io/api?module=account&action=balance&address={}&tag=latest&apikey={}"

@app.route('/execute', methods=['POST'])
def execute_pyhthon():
    addr = request.json['addr']
    r = requests.get(url.format(addr, API_KEY))
    json = r.json()
    result = int(json['result']) / 10**18

    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(port=5000)