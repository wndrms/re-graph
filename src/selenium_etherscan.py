from ctypes import addressof
from selenium import webdriver
import time
from explicit import waiter, XPATH
import os

url = 'https://etherscan.io/address/{}'

def crawl_etherscan(driver, address):
    driver.get(url.format(address))
    print(waiter.find_element(driver, '//*[@id="ContentPlaceHolder1_divSummary"]/div[1]/div[1]/*/div/span', by=XPATH).text)
    tags = waiter.find_element(driver, '//*[@id="ContentPlaceHolder1_divLabels"]', by=XPATH)
    lis = waiter.find_elements(driver, '/html/body/main/section[3]/ul/li', by=XPATH)
    tx_count = waiter.find_element(driver, '/html/body/main/section[3]/div[3]/div[1]/div/div[1]/div/p/a[1]', by=XPATH).text
    for li in lis:
        print(li.text)
    print(tags.text)
    print(tx_count)



addresses = []
word = 'href="/address/'
with open('test.txt', 'r') as file:
    for line in file:
        words = line.split()
        for w in words:
            if word in w:
                addresses.append(w.replace(word, '').replace('"', ''))

desktop = os.path.join(os.path.expanduser("~"), "Desktop")
driver_path = os.path.join(desktop, "dev/chromedriver")
driver = webdriver.Chrome(driver_path)

try:
    for address in addresses:
        crawl_etherscan(driver, address)
finally:
    driver.quit()
