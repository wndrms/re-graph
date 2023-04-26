from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)
API_KEY = "5167S634GJGKUS2AQDSCCV1FYXKVYR6XPQ"
url = "https://api.etherscan.io/api?module=account&action=balance&address={}&tag=latest&apikey={}"
url2 = "https://api.etherscan.io/api?module=account&action=txlist&address={}&startblock={}&endblock={}&page={}&offset=100&sort=dec&apikey={}"

@app.route('/execute', methods=['POST'])
def execute_pyhthon():
    addr = request.json['addr']
    r = requests.get(url.format(addr, API_KEY))
    json = r.json()
    result = int(json['result']) / 10**18

    return jsonify({'result': result})

@app.route('/loadtx', methods=['POST'])
def load_txlist():
    addr = request.json['addr']
    data = []
    for page in range(1, 100):
        r = requests.get(url2.format(addr, 1, 17086907, page, API_KEY))
        json = r.json()
        result = json['result']
        for tx in result:
            try:
                data.append({
                    'BlockNumber' : tx['blockNumber'],
                    'Timestamp' : tx['timeStamp'],
                    'hash': tx['hash'],
                    'from': tx['from'],
                    'to': tx['to'],
                    'value': int(tx['value'])/pow(10,18)
                })
            except Exception as e:
                print(tx)
                print(e)
    return jsonify({'result': data})

if __name__ == '__main__':
    app.run(port=5000)