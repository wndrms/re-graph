import requests
from datetime import datetime
from neo4j import GraphDatabase
import logging
from neo4j.exceptions import ServiceUnavailable

API_KEY = "5167S634GJGKUS2AQDSCCV1FYXKVYR6XPQ"
Target_ADDR = "0x0e57edba0fccb1e388926193c873120cab961fee"
START_BLOCK = 8139592
END_BLOCK = 99999999
url = "https://api.etherscan.io/api?module=account&action=txlist&address={}&startblock={}&endblock={}&page={}&offset=1000&sort=dec&apikey={}"
account_list = [Target_ADDR]
done = []
Contracts = ['0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', '0xf859a1ad94bcf445a406b892ef0d3082f4174088', '0x398ec7346dcd622edc5ae82352f02be94c62d119']
NEO4J_URI='neo4j+s://33d55752.databases.neo4j.io'
NEO4J_USERNAME='neo4j'
NEO4J_PASSWORD='fVru5CM_E3XdkqsS_zmC0JgN3vYtxc7Zu_ZGb6yp_yE'
AURA_INSTANCENAME='Instance01'

class App:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        # Don't forget to close the driver connection when you are finished with it
        self.driver.close()

    def create_tx(self, address1, address2, blocknum, timestamp, value, hash_num):
        with self.driver.session(database="neo4j") as session:
            try:
                #print("Creating tx between: {addr1}, {addr2}".format(addr1=address1, addr2=address2))
                result = session.execute_write(self._create_and_return_tx, address1, address2, blocknum, timestamp, value, hash_num)
                
                for row in result:
                    print("Created tx between: {addr1}, {addr2}".format(addr1=row['addr1'], addr2=row['addr2']))
            except Exception as e:
                print(e)

    @staticmethod
    def _create_and_return_tx(tx, address1, address2, blocknum, timestamp, value, hash_num):
        query = (
            "MERGE (addr1:EA { Address: $address1 }) "
            "ON CREATE SET addr1.Hacking_Case = $target, addr1.Account_Type = 'Wallet', addr1.Label = 'Dodgy' "
            "MERGE (addr2:EA { Address: $address2 }) "
            "ON CREATE SET addr2.Hacking_Case = $target, addr1.Account_Type = 'Wallet', addr1.Label = 'Dodgy' "
            "MERGE (addr1)-[:TX {hash: $hash, blocknum: $blocknum, timestamp: $timestamp, value: $value}]->(addr2) "
            "RETURN addr1, addr2"
        )
        result = tx.run(query, address1=address1, address2=address2, hash=hash_num, blocknum=blocknum, timestamp=timestamp, value=value, target=Target_ADDR)
        try:
            return [{"addr1": row["addr1"]["Address"], "addr2": row["addr2"]["Address"]}
                    for row in result]
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception
            ))
            raise
    
    def get_account_type(self, address):
        with self.driver.session(database="neo4j") as session:
            try:
                result = session.execute_read(self._get_account_type, address)
                if len(result) != 0:
                    return result[0]
                else:
                    return 'No Data'
            except Exception as e:
                print(e)
    @staticmethod
    def _get_account_type(tx, address):
        query = (
            "match (n:EA) where n.Address = $address return n.Account_Type"
        )
        result = tx.run(query, address=address)
        try:
            return [row['n.Account_Type'] for row in result]
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception
            ))
            raise
        

def crawl_tx(account, start, end, app):
    for page in range(1, 10):
        r = requests.get(url.format(account, start, end, page, API_KEY))
        json = r.json()
        result = json['result']
        for tx in result:
            data = {
                'BlockNumber' : tx['blockNumber'],
                'Timestamp' : tx['timeStamp'],
                'hash': tx['hash'],
                'from': tx['from'],
                'to': tx['to'],
                'value': int(tx['value'])/pow(10,18)
            }
            if data['value']>=0.5:
                app.create_tx(data['from'], data['to'], data['BlockNumber'], data['Timestamp'], data['value'], data['hash'])
                if data['to'] not in done and data['to'] not in account_list:
                    if app.get_account_type(data['to']) not in ['Smart Contract', 'Exchange'] :
                        account_list.append(data['to'])
    done.append(data['to'])

if __name__ == '__main__':
    i = 0
    uri = NEO4J_URI
    user = NEO4J_USERNAME
    password = NEO4J_PASSWORD

    app = App(uri, user, password)
    while True:
        l = len(account_list)
        print(account_list[i])
        print(account_list)
        crawl_tx(account_list[i], START_BLOCK, END_BLOCK, app)
        i = i + 1
        if i == len(account_list) and i == l:
            break
    app.close()