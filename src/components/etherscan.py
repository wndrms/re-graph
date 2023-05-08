import requests
from datetime import datetime
from neo4j import GraphDatabase
import logging
from neo4j.exceptions import ServiceUnavailable
import csv

csv_file_path = "eth_addresses.csv"

API_KEY = "5167S634GJGKUS2AQDSCCV1FYXKVYR6XPQ"
Target_ADDR = "0x7373dca267bdc623dfba228696c9d4e8234469f6"
START_BLOCK = 16247159
END_BLOCK = 16247463
url = "https://api.etherscan.io/api?module=account&action=txlist&address={}&startblock={}&endblock={}&page={}&offset=100&sort=dec&apikey={}"
account_list = [Target_ADDR]
done = []
Contracts = ['0xd90e2f925da726b50c4ed8d0fb90ad053324f31b']
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

    def create_EA(self, tmp):
        with self.driver.session(database="neo4j") as session:
            try:
                result = session.execute_write(self._create_and_return_EA, tmp)
                print("create EA : {}".format(tmp['Address']))
            except Exception as e:
                print(e)

    @staticmethod
    def _create_and_return_EA(tx, tmp):
        query = (
            "MERGE (w:EA { Address: $address, Name: $name, Account_Type: $account_type, Contract_Type: $contract_type, Label: $label, Tags: $tags}) "
            "RETURN w.Address"
        )
        result = tx.run(query, address=tmp['Address'], name=tmp['Name'], account_type=tmp['Account Type'], contract_type=tmp['Contract Type'], label=tmp['Label'], tags=tmp['Tags'])
        try:
            return result
        except ServiceUnavailable as exception:
            logging.error("{query} raised an error: \n {exception}".format(
                query=query, exception=exception
            ))
            raise


if __name__ == '__main__':
    i = 0
    uri = NEO4J_URI
    user = NEO4J_USERNAME
    password = NEO4J_PASSWORD
    check = False

    app = App(uri, user, password)
    with open(csv_file_path, newline="", encoding="utf-8") as csvfile:
        csv_reader = csv.reader(csvfile)

        for row in csv_reader:
            tags = row[6]
            for i in range(7, 12):
                if row[i] != '':
                    tags += tags + ', ' + row[i]
            tmp = {
                'Address': row[0],
                'Name': row[1],
                'Account Type': row[2],
                'Contract Type': row[3],
                'Label': row[5],
                'Tags': tags
            }
            if row[3] == '' and row[4] == 'DeFi':
                tmp['Contract Type'] = 'DeFi'
            if check:
                app.create_EA(tmp)
            if tmp['Address'] == '0x6fe2b5f6798c9d5d6aebe1335bbf03080acee7dc':
                check=True
    app.close()