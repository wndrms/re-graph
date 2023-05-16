addresses = []
word = 'href="/address/'
with open('test.txt', 'r') as file:
    for line in file:
        words = line.split()
        for w in words:
            if word in w:
                addresses.append(w.replace(word, '').replace('"', ''))

print(addresses)
print(len(addresses))